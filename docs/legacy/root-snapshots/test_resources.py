import unittest
from html.parser import HTMLParser
from pathlib import Path
from app import app
from test_candidate import BASE

class Tags(HTMLParser):
    def __init__(self, text):
        super().__init__(); self.tags=[]; self.feed(text)
    def handle_starttag(self, tag, attrs): self.tags.append((tag,dict(attrs)))

class ResourceAcceptance(unittest.TestCase):
    def test_resource_structure_and_verified_directory(self):
        text=(Path(__file__).resolve().parents[1]/'static/index.html').read_text()
        tags=Tags(text).tags
        ids={a['id']:(i,t,a) for i,(t,a) in enumerate(tags) if 'id' in a}
        self.assertGreater(ids['india-resources'][0],ids['download'][0])
        for name in ['police-resources','bank-resources']:
            self.assertEqual(ids[name][1],'details'); self.assertNotIn('open',ids[name][2])
        links=[a for t,a in tags if t=='a']
        for phone,url in [('1800111109','https://sbi.bank.in/en/web/customer-care/contact-us'),('18001600','https://www.hdfc.bank.in/contact-us'),('18002662','https://www.icici.bank.in/customer-care'),('18004030','https://www.axis.bank.in/contact-us')]:
            self.assertTrue(any(a.get('href')=='tel:'+phone for a in links))
            self.assertTrue(any(a.get('href')==url and a.get('rel')=='noopener noreferrer' for a in links))
        self.assertEqual(text.count('<li><strong>'),4)
        self.assertIn('general banking line',text)
        self.assertIn('do not establish the nearest authorized police station',text)
    def test_seven_to_eight_actions_and_export(self):
        c=app.test_client(); p={'facts':dict(BASE),'details':{'amount_inr':'4500'}}
        first=c.post('/api/assess',json=p).json; self.assertEqual(len(first['actions']),7)
        p['completed']={'A06':next(a['completion_token'] for a in first['actions'] if a['action_id']=='A06')}
        p['facts']['remote_access']='yes'; second=c.post('/api/assess',json=p).json
        self.assertEqual(len(second['actions']),8); self.assertEqual(set(second['completed']),{'A06'})
        exported=c.post('/api/summary',json=p)
        self.assertIn('4500.00',exported.text); self.assertEqual(exported.text.count('\nDONE — '),1)
        self.assertIn('attachment',exported.headers['Content-Disposition'])
