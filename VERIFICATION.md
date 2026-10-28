# v0.1.2-rc1 verification — 28 October 2026

Baseline verified: ac07862f9e5d04234abb7c415816ebb523456dea, tag v0.1.1.
Stable main worktree unchanged; separate sprint/v0.1.2-rc1 branch/worktree.

| Check | Executed result |
|---|---|
| Baseline controller + new regressions | 7 pass, 2 fail; both reported defects reproduced |
| Candidate Python suite | 22 pass: original 18 + four focused acceptance tests |
| Candidate controller suite | 9 pass: original seven + both defect regressions |
| Original database scenarios | 56/56 expected action sets match; expectations unchanged |
| Exhaustive baseline routing comparison | 11,664 answer combinations; zero selected-action differences |
| JSON response field-key comparison | No differences across those combinations |
| routing_rules.json | Byte-identical to baseline |
| Exact INR 4500 demo | Pass through Flask test client, including A06 progress, A05 addition and text export |
| JavaScript syntax | Pass |
| Candidate real browser + Windows walkthrough | Pending; no new browser execution claimed |
| Independent human guidance review | Pending; labels preserved |

Raw execution: candidate-test-output.txt, baseline-defect-reproduction.txt,
baseline-comparison.json. These checks are assistant-authored and are not legal
sign-off or independent human evaluation. Previous Windows/browser screenshots
and user-reported export relate to the earlier release, not this candidate.

Status: CONDITIONAL GO for candidate testing. Stable release remains v0.1.1.
Human source review and full demo-laptop browser walkthrough are promotion gates.
