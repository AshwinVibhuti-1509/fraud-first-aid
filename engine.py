"""Deterministic prototype routing. No network calls, ML or stored incidents."""
import hashlib
import json
from decimal import Decimal, InvalidOperation
from pathlib import Path

DATA = Path(__file__).parent / 'data'

def load(name):
    return json.loads((DATA / (name + '.json')).read_text(encoding='utf-8'))

QUESTIONS = load('questions')
ACTIONS = {x['action_id']: x for x in load('actions')}
SOURCES = {x['source_id']: x for x in load('sources')}
RULES = load('routing_rules')
VERSION = '2.2.0-review'

class InputError(ValueError):
    pass

def validate(payload):
    if not isinstance(payload, dict):
        raise InputError('Send a JSON object.')
    facts = payload.get('facts')
    if not isinstance(facts, dict):
        raise InputError('facts must contain the eight answers.')
    fields = {q['field'] for q in QUESTIONS}
    if set(facts) != fields:
        raise InputError('Provide exactly the eight supported answer fields.')
    for q in QUESTIONS:
        if facts[q['field']] not in q['options']:
            raise InputError('Choose a supported answer for ' + q['field'] + '.')
    details = payload.get('details', {})
    if not isinstance(details, dict) or set(details) - {'amount_inr', 'notes', 'reference'}:
        raise InputError('Unsupported incident details.')
    clean = {}
    for key, limit in [('notes', 1500), ('reference', 120)]:
        val = details.get(key, '')
        if not isinstance(val, str) or len(val) > limit:
            raise InputError(key + ' is too long or not text.')
        clean[key] = val.strip()
    amount = details.get('amount_inr')
    if amount is None or amount == '':
        clean['amount_inr'] = None
    else:
        try:
            if isinstance(amount, bool):
                raise InvalidOperation
            value = Decimal(str(amount))
            if not value.is_finite() or value < 0 or value > Decimal('999999999999') or value != value.quantize(Decimal('.01')):
                raise InvalidOperation
            clean['amount_inr'] = format(value, '.2f')
        except (InvalidOperation, ValueError):
            raise InputError('Enter a non-negative INR amount with at most two decimal places, or leave blank.')
    completed = payload.get('completed', {})
    if not isinstance(completed, dict) or len(completed) > len(ACTIONS):
        raise InputError('Invalid completion state.')
    for key, value in completed.items():
        if key not in ACTIONS or not isinstance(value, str) or len(value) != 64:
            raise InputError('Invalid completion token.')
    context = payload.get('context', {})
    if not isinstance(context, dict) or set(context) - {'incident_type','active_pressure','transaction_kind'}:
        raise InputError('Unsupported incident context.')
    from intake import KINDS
    if context.get('incident_type','unknown') not in KINDS:
        raise InputError('Unknown incident type.')
    if context.get('active_pressure','unknown') not in ('yes','no','unknown'):
        raise InputError('Invalid pressure status.')
    if context.get('transaction_kind','unknown') not in ('unauthorized','deceived','pending','unknown'):
        raise InputError('Invalid transaction kind.')
    return dict(facts), clean, completed, {
        'incident_type':context.get('incident_type','unknown'),
        'active_pressure':context.get('active_pressure','unknown'),
        'transaction_kind':context.get('transaction_kind','unknown')}


def matches(condition, facts):
    if 'all' in condition:
        return all(matches(c, facts) for c in condition['all'])
    if 'any' in condition:
        return any(matches(c, facts) for c in condition['any'])
    value = facts[condition['field']]
    if condition['op'] == 'eq':
        return value == condition['value']
    if condition['op'] == 'in':
        return value in condition['value']
    raise ValueError('Unsupported rule operator')

def fields_used(condition):
    if 'field' in condition:
        return {condition['field']}
    return set().union(*(fields_used(c) for c in condition.get('all', condition.get('any', []))))

def assess(payload):
    facts, details, completed, context = validate(payload)
    selected = []
    for rule in sorted(RULES, key=lambda r: (r['priority'], r['rule_id'])):
        if not matches(rule['condition'], facts):
            continue
        action = dict(ACTIONS[rule['action_id']])
        relevant = {k: facts[k] for k in sorted(fields_used(rule['condition']))}
        token = hashlib.sha256(json.dumps([VERSION, action, rule, relevant], sort_keys=True).encode()).hexdigest()
        action.update(reason=rule['rationale'], rule_id=rule['rule_id'], priority=rule['priority'],
                      completion_token=token, completed=completed.get(action['action_id']) == token,
                      source=SOURCES.get(action['source_id']))
        selected.append(action)
    # Confirmed high-signal context must override a contradictory routine-payment label.
    if facts['country']=='IN' and (context['active_pressure']=='yes' or context['transaction_kind']=='unauthorized' or context['incident_type'] in ('sim','account','remote','credentials','coercion')):
        selected=[a for a in selected if a['action_id']!='A11']
        # The user-confirmed unauthorized-transaction category calls for prompt bank verification,
        # even if the earlier suspicion answer was 'no'. It never establishes fraud or liability.
        if context['transaction_kind']=='unauthorized':
            for aid,reported in [('A01','bank_reported'),('A02','official_reported')]:
                if facts[reported]=='yes' or any(a['action_id']==aid for a in selected):continue
                a=dict(ACTIONS[aid]); relevant={'transaction_kind':'unauthorized',reported:facts[reported]}
                token=hashlib.sha256(json.dumps([VERSION,aid,'R-CONTEXT-UNAUTH',relevant],sort_keys=True).encode()).hexdigest()
                a.update(reason='You indicated an unrecognised transaction. Contact the bank for verification promptly; this is not a finding of fraud.',
                         rule_id='R-CONTEXT-UNAUTH-'+aid,priority=10,completion_token=token,
                         completed=completed.get(aid)==token,source=SOURCES.get(a['source_id']))
                selected.append(a)

    # Independent optional scenario context extends, but does not override, the legacy rules.
    # Only confirmed context supplied by the browser can select these extra actions.
    if facts['country'] == 'IN':
        extra_ids = []
        kind=context['incident_type']
        if context['active_pressure']=='yes': extra_ids.append(('A13','R-CONTEXT-PRESSURE',9,'You confirmed ongoing pressure or threatening contact.','active_pressure'))
        if kind=='sim': extra_ids.append(('A14','R-CONTEXT-SIM',21,'You selected a possible SIM or telecommunications issue; this is not a SIM-swap diagnosis.','incident_type'))
        if kind=='account' and facts['credentials_exposed'] in ('yes','unknown'):
            extra_ids.append(('A15','R-CONTEXT-ACCOUNT',24,'You selected an account-access concern and have not excluded possible exposure.','incident_type'))
        if kind in ('payment','unauthorized','job','investment','shopping','coercion','request') and facts['suspected_fraud']!='no':
            extra_ids.append(('A16','R-CONTEXT-EVIDENCE',35,'You selected a situation where messages and payment evidence may support reporting.','incident_type'))
        if context['transaction_kind']=='unauthorized':
            extra_ids.append(('A17','R-CONTEXT-RBI',42,'You identified a possibly unauthorised transaction; RBI applicability requires independent review.','transaction_kind'))
        if (facts['bank_reported']=='yes' or facts['official_reported']=='yes') and facts['suspected_fraud']=='yes':
            extra_ids.append(('A18','R-CONTEXT-FOLLOWUP',45,'You indicated that at least one reporting channel has already been used.','bank_reported'))
        for aid,rid,priority,reason,dependency in extra_ids:
            a=dict(ACTIONS[aid]); rel={dependency:context.get(dependency, facts.get(dependency))}
            if dependency=='bank_reported': rel={'bank_reported':facts['bank_reported'],'official_reported':facts['official_reported']}
            token=hashlib.sha256(json.dumps([VERSION,aid,rid,rel],sort_keys=True).encode()).hexdigest()
            a.update(reason=reason,rule_id=rid,priority=priority,completion_token=token,
                     completed=completed.get(aid)==token,source=SOURCES.get(a['source_id']))
            selected.append(a)
        selected.sort(key=lambda a:(a['priority'],a['rule_id']))
    unknown = [q['prompt'] for q in QUESTIONS if facts[q['field']] == 'unknown']
    notices = []
    if facts['country'] == 'OTHER':
        notices.append('This prototype supports India. Indian reporting procedures are not applied to your case.')
    if facts['suspected_fraud'] == 'no' and ('yes' in [facts['credentials_exposed'], facts['remote_access']]):
        notices.append('You selected no suspected fraud but reported possible account or device exposure. Review those answers; protective actions are still included.')
    if facts['money_moved'] == 'no' and details['amount_inr'] not in (None, '0.00'):
        notices.append('You entered an amount but said no money moved. Clarify this before sharing the summary; the amount does not override your answer.')
    return {'version': VERSION, 'facts': facts, 'details': details, 'context': context, 'actions': selected,
            'unknown_questions': unknown, 'notices': notices,
            'completed': {a['action_id']: a['completion_token'] for a in selected if a['completed']},
            'disclaimer': 'Prototype guidance, not a finding of fraud. No complaint is submitted and recovery is not guaranteed.'}

def safe_json_field(value):
    return (json.dumps(value, ensure_ascii=False)
            .replace("\u0085", "\\u0085")
            .replace("\u2028", "\\u2028")
            .replace("\u2029", "\\u2029"))

def summary(result):
    lines = ['FRAUD FIRST AID — PERSONAL INCIDENT SUMMARY',
             'User-provided facts; not verified by a bank, authority or this prototype.',
             'No complaint has been submitted by this app.', '', 'ANSWERS AT ASSESSMENT']
    for q in QUESTIONS:
        lines.append(q['prompt'] + ': ' + result['facts'][q['field']])
    if result.get('context') and any(v!='unknown' for v in result['context'].values()):
        lines += ['', 'ADDITIONAL USER-CONFIRMED CONTEXT']
        lines += [key.replace('_',' ').title()+': '+value for key,value in result['context'].items()]
    d = result['details']
    lines += ['', 'Amount (INR): ' + (d['amount_inr'] if d['amount_inr'] is not None else 'Unknown / not provided'),
              'Reference (user supplied; JSON-escaped): ' + (json.dumps(d['reference'], ensure_ascii=False) if d['reference'] else 'Not provided'),
              'Notes (user supplied; JSON-escaped): ' + (json.dumps(d['notes'], ensure_ascii=False) if d['notes'] else 'Not provided')]
    lines += ['', 'CHECKLIST PROGRESS SINCE ASSESSMENT (SELF-REPORTED)']
    for a in result['actions']:
        lines += [('DONE — ' if a['completed'] else 'NOT MARKED DONE — ') + a['title'], a['action_text'], 'Why shown: ' + a['reason']]
        lines.append('Source: ' + (a['source']['url'] if a['source'] else 'Team-designed organisational suggestion'))
    lines += ['', 'ITEMS TO CLARIFY'] + (result['unknown_questions'] or ['None marked unknown.'])
    lines += result['notices'] + ['', result['disclaimer']]
    return '\n'.join(lines) + '\n'
