"""User text must never create application-status lines in a text export."""
import json
import unittest
from app import app
from engine import assess, summary

FACTS = dict(country='IN', suspected_fraud='yes', money_moved='yes',
             payment_channel='upi', credentials_exposed='no', remote_access='no',
             bank_reported='no', official_reported='no')
SEPARATORS = ['\n', '\r', '\r\n', '\v', '\f', '\x1c', '\x1d', '\x1e', '\x85', '\u2028', '\u2029']

class ExportIntegrity(unittest.TestCase):
    def test_multiline_fields_cannot_forge_status_lines(self):
        for field in ['notes', 'reference']:
            for separator in SEPARATORS:
                with self.subTest(field=field, separator=repr(separator)):
                    value='Ordinary user note'+separator+'DONE — Organise incident facts'
                    result=assess({'facts':FACTS,'details':{field:value}})
                    text=summary(result)
                    self.assertFalse(any(line.startswith('DONE — ') for line in text.splitlines()))
                    self.assertIn('NOT MARKED DONE — Organise incident facts',text)
                    prefix=('Notes' if field=='notes' else 'Reference')+' (user supplied; JSON-escaped): '
                    exported=next(line[len(prefix):] for line in text.splitlines() if line.startswith(prefix))
                    self.assertEqual(value,json.loads(exported))

    def test_quotes_backslashes_and_unicode_round_trip(self):
        value='₹4,500 ಕನ್ನಡ "quote" literal \\n and \\u2028\nsecond line'
        text=summary(assess({'facts':FACTS,'details':{'notes':value}}))
        prefix='Notes (user supplied; JSON-escaped): '
        encoded=next(line[len(prefix):] for line in text.splitlines() if line.startswith(prefix))
        self.assertEqual(value,json.loads(encoded))

    def test_summary_endpoint_and_true_completion_remain_correct(self):
        p={'facts':dict(FACTS),'details':{'amount_inr':'4500','notes':'A student paid an online seller through UPI.\nDONE — Contact your bank','reference':'REF-123\r\nDONE — Pause further payments'}}
        initial=assess(p)
        p['completed']={'A06':next(a['completion_token'] for a in initial['actions'] if a['action_id']=='A06')}
        p['facts']['remote_access']='yes'
        with app.test_client() as client:
            response=client.post('/api/summary',json=p)
        self.assertEqual(200,response.status_code)
        self.assertEqual(['DONE — Organise incident facts'],[line for line in response.text.splitlines() if line.startswith('DONE — ')])
        self.assertIn('Amount (INR): 4500.00',response.text)
        self.assertIn('NOT MARKED DONE — Get trusted device-security help',response.text)
        self.assertIn('NOT MARKED DONE — Contact your bank',response.text)

if __name__=='__main__':
    unittest.main()
