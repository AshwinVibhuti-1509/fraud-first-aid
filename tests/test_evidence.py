"""Offline security & schema tests; no real personal evidence."""
import base64
import io
import unittest
from PIL import Image
from evidence import EvidenceError, sanitized_png, modes

class EvidenceSafety(unittest.TestCase):
 def fixture(self,format='PNG'):
  im=Image.new('RGB',(64,64),'white');b=io.BytesIO();im.save(b,format=format)
  return 'data:image/png;base64,'+base64.b64encode(b.getvalue()).decode()
 def test_valid_flattened_image(self):
  png=sanitized_png(self.fixture());self.assertTrue(png.startswith(b'\x89PNG\r\n\x1a\n'))
 def test_corrupt_image_rejected(self):
  with self.assertRaises(EvidenceError):sanitized_png('data:image/png;base64,'+base64.b64encode(b'\x89PNG\r\n\x1a\ninvalid').decode())
 def test_forged_signature_rejected(self):
  with self.assertRaises(EvidenceError):sanitized_png('data:image/png;base64,'+base64.b64encode(b'GIF89a').decode())
 def test_wrong_mime_rejected(self):
  with self.assertRaises(EvidenceError):sanitized_png('data:image/jpeg;base64,AA==')
 def test_oversized_payload_rejected(self):
  with self.assertRaises(EvidenceError):sanitized_png('data:image/png;base64,'+'A'*3000000)
 def test_mode_flags_shape(self):
  self.assertTrue({'local_ocr','ai_vision','ai_provider'}<=set(modes()))
if __name__=='__main__':unittest.main()
