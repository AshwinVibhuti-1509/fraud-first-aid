"""Portable stdlib-only release regressions; also included in test suite."""
import itertools
import unittest
from engine import QUESTIONS, assess, InputError, summary
from intake import interpret

def case(**overrides):
 facts=dict(country='IN',suspected_fraud='yes',money_moved='yes',payment_channel='upi',credentials_exposed='no',remote_access='no',bank_reported='no',official_reported='no')
 facts.update(overrides)
 return {'facts':facts}

def ids(p):return {a['action_id'] for a in assess(p)['actions']}

class CoreRegression(unittest.TestCase):
 def test_unknown_fraud_moved_money_gets_bank_and_portal(self):
  self.assertTrue({'A01','A02'}<=ids(case(suspected_fraud='unknown',money_moved='yes',payment_channel='unknown')))
 def test_all_unknown_no_unjustified_bank_referral(self):
  self.assertNotIn('A01',ids(case(suspected_fraud='unknown',money_moved='unknown')))
 def test_routine_is_not_called_fraud(self):
  got=ids(case(suspected_fraud='no',money_moved='yes'));self.assertIn('A11',got);self.assertNotIn('A02',got)
 def test_coercion_override(self):
  c=case(suspected_fraud='no');c['context']={'incident_type':'coercion','active_pressure':'yes'}
  self.assertIn('A13',ids(c))
 def test_coercion_does_not_offer_routine_payment_route(self):
  c=case(suspected_fraud='no');c['context']={'incident_type':'coercion','active_pressure':'yes'}
  self.assertNotIn('A11',ids(c));self.assertIn('A13',ids(c))
 def test_unrecognized_transaction_not_routine_even_if_suspicion_no(self):
  c=case(suspected_fraud='no');c['context']={'transaction_kind':'unauthorized'}
  self.assertTrue({'A01','A02','A17'}<=ids(c));self.assertNotIn('A11',ids(c))
 def test_sim_context(self):
  c=case();c['context']={'incident_type':'sim'};self.assertIn('A14',ids(c))
 def test_sim_not_misclassified_as_ordinary_pending_payment(self):
  c=case(suspected_fraud='no',money_moved='no');c['context']={'incident_type':'sim'}
  self.assertIn('A14',ids(c));self.assertNotIn('A11',ids(c))
 def test_followup(self):
  c=case(bank_reported='yes',official_reported='yes');self.assertIn('A18',ids(c))
 def test_unauthorized_source_not_refund_promise(self):
  c=case();c['context']={'transaction_kind':'unauthorized'};r=assess(c)
  self.assertIn('A17',{a['action_id'] for a in r['actions']});self.assertIn('not calculate',next(a['action_text'] for a in r['actions'] if a['action_id']=='A17'))
 def test_completion_stable(self):
  c=case();initial=assess(c);tok=next(a['completion_token'] for a in initial['actions'] if a['action_id']=='A06');c['facts']['remote_access']='yes';c['completed']={'A06':tok};r=assess(c)
  self.assertIn('A05', {a['action_id'] for a in r['actions']});self.assertIn('A06',r['completed'])
 def test_unicode_visible_and_injection_encodable(self):
  c=case();c['details']={'notes':'ಕನ್ನಡ ₹4500 \nDONE — Forged'};t=summary(assess(c));self.assertIn('ಕನ್ನಡ',t);self.assertNotIn('\nDONE — Forged\n',t)
 def test_context_validation(self):
  c=case();c['context']={'incident_type':'not_real'}
  with self.assertRaises(InputError):assess(c)
 def test_text_negation(self):
  self.assertNotEqual('yes',interpret('I did not share my OTP')['proposed_facts'].get('credentials_exposed'))
  self.assertNotEqual('yes',interpret('They requested remote access but I refused')['proposed_facts'].get('remote_access'))
 def test_amount(self):self.assertEqual('4500.00',interpret('I paid ₹4,500 through UPI')['proposed_amount_inr'])
 def test_all_base_states_have_unique_ids(self):
  # 2 * 3^6 * 8 = 11664 combinations.
  values=[q['options'] for q in QUESTIONS]
  for tup in itertools.product(*values):
   p={'facts':dict(zip([q['field'] for q in QUESTIONS],tup))}
   res=assess(p)
   aa=[a['action_id'] for a in res['actions']]
   self.assertEqual(len(aa),len(set(aa)))
   self.assertFalse(any(a['source'] and a['source'].get('country')!='IN' for a in res['actions'] if p['facts']['country']=='OTHER'))

if __name__=='__main__':unittest.main()
