"""Candidate acceptance examples authored separately from the routing rules."""
import unittest
from app import app
from engine import assess, summary

BASE = dict(country='IN', suspected_fraud='yes', money_moved='yes',
            payment_channel='upi', credentials_exposed='no', remote_access='no',
            bank_reported='no', officially_reported='no')
BASE['official_reported'] = BASE.pop('officially_reported')

class CandidateAcceptance(unittest.TestCase):
    def test_exposure_without_loss_keeps_conditional_banking_guidance(self):
        r=assess({'facts':{**BASE,'credentials_exposed':'yes','money_moved':'no'}})
        actions={a['action_id']:a for a in r['actions']}
        self.assertEqual({'A02','A03','A04','A06','A07'},set(actions))
        text=actions['A04']['action_text']
        self.assertIn('If banking',text)
        self.assertIn('only if banking or payment access was involved',text)
        self.assertNotIn('reset an OTP',text)
        exported=summary(r)
        self.assertIn('https://cyber.delhipolice.gov.in/vishing.html',exported)
        self.assertIn('https://consumer.ftc.gov/',exported)

    def test_unknown_and_non_india_scope(self):
        r=assess({'facts':{**BASE,'suspected_fraud':'unknown'}})
        self.assertEqual('unknown',r['facts']['suspected_fraud'])
        action=next(a for a in r['actions'] if a['action_id']=='A10')
        self.assertIn('debit you do not recognise',action['action_text'])
        self.assertIn('pending payment alone does not establish fraud',action['action_text'])
        other=assess({'facts':{**BASE,'country':'OTHER','credentials_exposed':'yes'}})
        self.assertEqual(['A12'],[a['action_id'] for a in other['actions']])
        self.assertNotIn('1930',summary(other))

    def test_exact_demo_and_export(self):
        c=app.test_client()
        p={'facts':dict(BASE),'details':{'amount_inr':'4500','notes':'A student paid an online seller through UPI. The seller requested an additional fee and stopped responding.'}}
        first=c.post('/api/assess',json=p)
        self.assertEqual(200,first.status_code)
        bank=next(a for a in first.json['actions'] if a['action_id']=='A01')
        self.assertIn('does not determine refund eligibility or liability',bank['action_text'])
        p['completed']={'A06':next(a['completion_token'] for a in first.json['actions'] if a['action_id']=='A06')}
        p['facts']['remote_access']='yes'
        p['details']['notes']+=' The seller also requested screen-sharing access.'
        second=c.post('/api/assess',json=p)
        self.assertEqual(200,second.status_code)
        self.assertEqual({'A06'},set(second.json['completed']))
        device=next(a for a in second.json['actions'] if a['action_id']=='A05')
        self.assertFalse(device['completed'])
        exported=c.post('/api/summary',json=p)
        self.assertEqual(200,exported.status_code)
        self.assertIn('Amount (INR): 4500.00',exported.text)
        self.assertIn('\nDONE — Organise incident facts',exported.text)
        self.assertIn('NOT MARKED DONE — Get trusted device-security help',exported.text)
        self.assertEqual(1,exported.text.count('\nDONE — '))

    def test_human_review_labels_remain_pending(self):
        r=assess({'facts':{**BASE,'credentials_exposed':'yes','payment_channel':'unknown'}})
        for a in r['actions']:
            if a['action_id'] in ['A01','A04','A10']:
                self.assertIn('pending',a['review_status'])
                self.assertFalse(a['refund_guarantee'])

if __name__=='__main__':
    unittest.main()
