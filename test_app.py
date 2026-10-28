"""Hand-authored acceptance checks, independent of the generated case expectations.
These are still assistant-authored; teammate review is a separate release gate.
"""
import unittest
from app import app
from engine import assess, summary, InputError

BASE = dict(country='IN', suspected_fraud='yes', money_moved='yes', payment_channel='upi',
            credentials_exposed='no', remote_access='no', bank_reported='no', official_reported='no')

def case(**changes):
    return {'facts': {**BASE, **changes}}

def ids(result):
    return {a['action_id'] for a in result['actions']}

class Acceptance(unittest.TestCase):
    def test_deceived_payment(self):
        result = assess(case())
        self.assertTrue({'A01', 'A02', 'A03', 'A08', 'A09'} <= ids(result))
        self.assertNotIn('A11', ids(result))
        self.assertTrue(all(a['source'] for a in result['actions'] if a['action_id'] in {'A01','A02'}))

    def test_credentials_without_loss(self):
        result = assess(case(money_moved='no', credentials_exposed='yes'))
        self.assertIn('A04', ids(result))
        self.assertNotIn('A09', ids(result))

    def test_overlapping_device_and_account_exposure(self):
        result = assess(case(remote_access='yes', credentials_exposed='yes'))
        self.assertTrue({'A01','A02','A04','A05'} <= ids(result))

    def test_unknown_does_not_invent_a_verdict(self):
        result = assess(case(suspected_fraud='unknown', money_moved='unknown'))
        self.assertIn('A10', ids(result))
        self.assertEqual('unknown', result['facts']['money_moved'])
        self.assertEqual(2, len(result['unknown_questions']))

    def test_routine_payment_not_assumed_fraud(self):
        result = assess(case(suspected_fraud='no'))
        self.assertIn('A11', ids(result))
        self.assertFalse({'A01','A02','A03','A09'} & ids(result))

    def test_other_country(self):
        result = assess(case(country='OTHER'))
        self.assertEqual({'A12'}, ids(result))
        self.assertNotIn('1930', summary(result))

    def test_known_report_is_not_repeated(self):
        result = assess(case(bank_reported='yes', official_reported='yes'))
        self.assertNotIn('A01', ids(result))
        self.assertNotIn('A02', ids(result))
        self.assertIn('A07', ids(result))

    def test_completion_preserved_for_unchanged_step(self):
        first = assess(case())
        token = next(a['completion_token'] for a in first['actions'] if a['action_id']=='A06')
        payload = case(remote_access='yes');payload['completed']={'A06':token}
        self.assertIn('A06', assess(payload)['completed'])

    def test_completion_dropped_for_changed_context(self):
        first = assess(case())
        token = next(a['completion_token'] for a in first['actions'] if a['action_id']=='A01')
        payload=case(payment_channel='card');payload['completed']={'A01':token}
        self.assertEqual({}, assess(payload)['completed'])

    def test_removed_step_dropped(self):
        first=assess(case());payload=case(suspected_fraud='no')
        payload['completed']={a['action_id']:a['completion_token'] for a in first['actions']}
        self.assertNotIn('A01',assess(payload)['completed'])

    def test_blank_and_zero_amount_distinct(self):
        self.assertIn('Unknown / not provided',summary(assess(case())))
        payload=case();payload['details']={'amount_inr':0}
        self.assertIn('Amount (INR): 0.00', summary(assess(payload)))

    def test_invalid_amounts(self):
        for amount in [-1,'NaN','Infinity','3.456',True,'1e1000000']:
            with self.subTest(amount=amount), self.assertRaises(InputError):
                assess({**case(),'details':{'amount_inr':amount}})

    def test_contradiction_visible_not_silently_fixed(self):
        result=assess({**case(money_moved='no'), 'details':{'amount_inr':'4500'}})
        self.assertTrue(result['notices'])
        self.assertEqual('no',result['facts']['money_moved'])

    def test_summary_truthful_and_current(self):
        payload=case();first=assess(payload)
        payload['completed']={'A01': next(a['completion_token'] for a in first['actions'] if a['action_id']=='A01')}
        text=summary(assess(payload))
        self.assertIn('DONE — Contact your bank',text)
        self.assertIn('No complaint has been submitted by this app.',text)
        self.assertIn('SELF-REPORTED',text)
        self.assertIn('https://www.rbi.org.in/',text)

class Integration(unittest.TestCase):
    def setUp(self):
        self.client=app.test_client()

    def test_page_assets_and_questions(self):
        for path in ['/','/static/app.js','/static/style.css','/api/questions','/api/health']:
            with self.client.get(path) as response:
                self.assertEqual(200,response.status_code,path)
        with self.client.get('/') as response:
            page=response.text
        self.assertIn('href="tel:1930"',page)
        self.assertIn('https://cybercrime.gov.in',page)
        self.assertEqual(8,len(self.client.get('/api/questions').json['questions']))

    def test_full_api_and_export(self):
        result=self.client.post('/api/assess',json=case())
        self.assertEqual(200,result.status_code)
        a=result.json['actions'][0]
        payload=case();payload['completed']={a['action_id']:a['completion_token']}
        download=self.client.post('/api/summary',json=payload)
        self.assertEqual(200,download.status_code)
        self.assertIn('attachment',download.headers['Content-Disposition'])
        self.assertIn('DONE — '+a['title'],download.text)
        self.assertEqual('no-store',download.headers['Cache-Control'])

    def test_validation(self):
        for payload in [None,[],{}, {'facts':{}},case(country='US'),case(money_moved=[]),{**case(),'completed':{'A99':'a'*64}}]:
            with self.subTest(payload=payload):
                self.assertEqual(400,self.client.post('/api/assess',json=payload).status_code)
        self.assertEqual(400,self.client.post('/api/assess',data='{',content_type='application/json').status_code)
        self.assertEqual(413,self.client.post('/api/assess',data='x'*20000,content_type='application/json').status_code)

    def test_no_state_leaks_between_requests(self):
        first=self.client.post('/api/assess',json=case()).json
        completed={a['action_id']:a['completion_token'] for a in first['actions']}
        self.client.post('/api/assess',json={**case(),'completed':completed})
        self.assertEqual({},self.client.post('/api/assess',json=case()).json['completed'])

if __name__=='__main__':
    unittest.main(verbosity=2)
