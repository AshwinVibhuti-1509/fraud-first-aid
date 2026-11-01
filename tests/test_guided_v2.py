"""Phase-one UI boundaries. Actual browser coverage is in browser_guided_v2.cjs."""
import unittest
from pathlib import Path
from app import app

ROOT = Path(__file__).resolve().parents[1]

class GuidedV2Boundary(unittest.TestCase):
    def test_home_and_classic_are_separate(self):
        c=app.test_client()
        self.assertIn('Something suspicious happened',c.get('/').text)
        self.assertIn('id="incident-form"',c.get('/classic').text)
        self.assertNotIn('/static/app.js',c.get('/').text)
        for p in ['/static/guided.js','/static/guided.css','/static/fictional-evidence.svg']:
            self.assertEqual(c.get(p).status_code,200)

    def test_image_endpoint_is_opt_in_and_bounded(self):
        c=app.test_client(); html=c.get('/').text
        self.assertIn('type="file"',html)
        self.assertIn('id="image-consent"',html)
        self.assertEqual(c.post('/api/evidence/analyze',json={'image':'not an image'}).status_code,400)
        status=c.get('/api/intake/options').json
        self.assertIn('local_ocr',status['image']);self.assertIn('ai_vision',status['image'])

    def test_request_size_boundary_remains(self):
        c=app.test_client()
        r=c.post('/api/assess',data='x'*17000,content_type='application/json')
        self.assertEqual(r.status_code,413)
        self.assertEqual(app.config['MAX_CONTENT_LENGTH'],16*1024)

    def test_no_persistence_or_provider_in_ui(self):
        js=(ROOT/'static/guided.js').read_text()
        for forbidden in ['localStorage','sessionStorage','indexedDB','api.openai','api.anthropic','innerHTML']:
            self.assertNotIn(forbidden,js)
        self.assertIn("'/api/assess'",js)
        self.assertIn("'/api/summary'",js)
