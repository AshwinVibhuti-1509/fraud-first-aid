"""Explainable, conservative text intake. Produces suggestions, never confirmed facts."""
import re

KINDS = {
 'unknown':'Not sure','payment':'Suspicious UPI / other payment','unauthorized':'Unrecognised bank transaction',
 'credentials':'Exposed OTP, PIN or password','remote':'Remote-access or screen sharing',
 'job':'Fake job or task scheme','investment':'Investment or trading scheme',
 'shopping':'Online shopping scam','account':'Online account compromise',
 'sim':'Possible SIM-swap issue','coercion':'Threatening impersonation / digital arrest',
 'request':'Suspicious payment request'
}

# A preset only proposes a category and payment rail, not guilt, loss, or exposure.
PRESETS = {'payment':{'payment_channel':'upi'}, 'unauthorized':{}, 'credentials':{},
 'remote':{}, 'job':{},'investment':{},'shopping':{},'account':{},'sim':{},'coercion':{},'request':{},'unknown':{}}

NEGATION = re.compile(r'\b(?:not|never|didn.t|did not|haven.t|have not|no|refused|declined|without)\b',re.I)
UNCERTAIN = re.compile(r'\b(?:maybe|might|possibly|unsure|not sure|don.t know|uncertain|suspect)\b',re.I)

def cautious_match(text, pattern):
    """Classifies one matching clause as mentioned / explicitly negated / ambiguous."""
    m = re.search(pattern, text, flags=re.I)
    if not m: return None
    left = text[max(0,m.start()-65):m.start()]
    # Do not cross a sentence or contrasting conjunction to borrow a negation.
    left = re.split(r'[.!?;\n]|\b(?:but|however|although|then)\b', left, flags=re.I)[-1]
    if NEGATION.search(left): return 'negated'
    if UNCERTAIN.search(left): return 'uncertain'
    return 'mentioned'

def interpret(text, category='unknown'):
    if not isinstance(text,str) or len(text)>1500: raise ValueError('Description must have 1,500 characters or fewer.')
    if category not in KINDS: raise ValueError('Unsupported incident category.')
    proposed = dict(PRESETS[category]); evidence={}; observations=[]
    def add(field,value,why):
        if field not in proposed:
            proposed[field]=value; evidence[field]=why
    patterns = [
       ('payment_channel','upi',r'\bupi\b|\b(?:gpay|phonepe|google pay|paytm upi)\b'),
       ('payment_channel','card',r'\b(?:debit card|credit card)\b'),
       ('payment_channel','bank_transfer',r'\b(?:neft|rtgs|imps|bank transfer)\b'),
       ('payment_channel','wallet',r'\b(?:payment wallet|e-wallet)\b'),
    ]
    for field,value,pattern in patterns:
        if cautious_match(text,pattern)=='mentioned':add(field,value,'Payment method explicitly mentioned in your description.');break
    loss_pattern=r'\b(?:i paid|i sent|i transferred|money was debited|account was debited|i lost|amount was deducted|debited my account)\b'
    loss = cautious_match(text, loss_pattern)
    if loss=='mentioned':add('money_moved','yes','Your description explicitly describes a payment or debit; please confirm its status.')
    elif loss=='uncertain':observations.append('You sounded uncertain whether money moved. Please check the actual account status.')
    if cautious_match(text,r'\b(?:unauthori[sz]ed|without my permission|scammer|fraudulent|fake seller|scammed)\b')=='mentioned':
        add('suspected_fraud','yes','Your wording suggests a possible fraud concern, not a confirmed finding.')
    credential = cautious_match(text,r'\b(?:shared|gave|revealed|entered|exposed)\s+(?:my |the |an? )?(?:otp|pin|password|passcode|login details|card details)\b')
    if credential=='mentioned':add('credentials_exposed','yes','Your description says login or payment credentials were disclosed. Confirm before proceeding.')
    remote = cautious_match(text,r'\b(?:installed|gave|granted|allowed|enabled)\b.{0,28}\b(?:anydesk|teamviewer|remote access|screen shar(?:ing|e)|access to (?:my |the )?phone)\b')
    if remote=='mentioned':add('remote_access','yes','Your description suggests remote access was allowed. Confirm whether access actually occurred.')
    if cautious_match(text,r'\b(?:asked|requested|wanted)\b.{0,30}\b(?:anydesk|remote access|screen share|screen sharing)\b'):
        observations.append('Someone may have requested device access; a request alone does not mean access was granted.')
    amount = None
    m=re.search(r'(?:₹|rs\.?\s*|inr\s*)([\d,]+(?:\.\d{1,2})?)',text,re.I)
    if m:
        raw=m.group(1).replace(',','')
        try:
            from decimal import Decimal
            amt=Decimal(raw)
            if 0<=amt<=999999999999: amount=format(amt,'.2f')
        except Exception: pass
    if category!='unknown':observations.append('Selected category: '+KINDS[category]+' (a starting point, not a diagnosis).')
    return {'proposed_facts':proposed,'reasons':evidence,'observations':observations,
            'proposed_amount_inr':amount,'needs_user_confirmation':True,
            'notice':'Suggestions are conservative keyword observations. Negation and context may be imperfect. Confirm every fact.'}
