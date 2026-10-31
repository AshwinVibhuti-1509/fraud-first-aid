import unittest
from html.parser import HTMLParser
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


class ScriptParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.scripts = []

    def handle_starttag(self, tag, attrs):
        if tag == "script":
            attributes = dict(attrs)
            if "src" in attributes:
                self.scripts.append(attributes)


class ScriptLoadingTests(unittest.TestCase):
    def test_examples_load_once_after_app(self):
        parser = ScriptParser()
        parser.feed(
            (ROOT / "static" / "index.html").read_text(encoding="utf-8")
        )

        sources = [script["src"] for script in parser.scripts]

        self.assertEqual(sources.count("/static/app.js"), 1)
        self.assertEqual(sources.count("/static/examples.js"), 1)

        self.assertLess(
            sources.index("/static/app.js"),
            sources.index("/static/examples.js"),
        )

        for source in ("/static/app.js", "/static/examples.js"):
            script = next(
                item for item in parser.scripts
                if item["src"] == source
            )
            self.assertIn("defer", script)
            self.assertNotIn("async", script)

            local_file = ROOT / source.lstrip("/")
            self.assertTrue(local_file.is_file())


if __name__ == "__main__":
    unittest.main()
