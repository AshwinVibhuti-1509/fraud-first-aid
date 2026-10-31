"""Run reproducible implementation checks. No real incident data is used."""
import json
import shutil
import subprocess
import sys
from pathlib import Path
from engine import VERSION, assess, load

ROOT = Path(__file__).resolve().parent

def main():
    print('Fraud First Aid', VERSION, '— local implementation checks', flush=True)
    suite = subprocess.run([sys.executable, '-m', 'unittest', 'discover', '-s', 'tests', '-v'], cwd=ROOT)
    if suite.returncode:
        return suite.returncode
    cases = load('synthetic_cases')
    failed = []
    for case in cases:
        actual = {a['action_id'] for a in assess({'facts': case['facts']})['actions']}
        if actual != set(case['expected_action_ids']):
            failed.append(case['case_id'])
    print(json.dumps({'database_scenarios':len(cases),'mismatches':failed}), flush=True)
    if failed:
        return 1
    node = shutil.which('node')
    if node:
        test_files = [
            str(path.relative_to(ROOT))
            for path in sorted((ROOT / 'tests').glob('*.test.cjs'))
        ]

        frontend = subprocess.run(
        [node, '--test', *test_files],
            cwd=ROOT,
        )
        if frontend.returncode:
            return frontend.returncode
    else:
        print('SKIPPED: controller tests require Node.js. Node is NOT needed to run the app.', flush=True)
    print('Completed available checks. Browser walkthrough and human guidance review are separate gates.', flush=True)
    return 0

if __name__ == '__main__':
    raise SystemExit(main())
