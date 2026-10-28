# Laptop/browser acceptance — record results, do not assume passes

Tester: ______  Laptop/browser: ______  Date/time: ______  Release: v0.1.2-rc1

| Check | Expected | Actual / pass / fail |
|---|---|---|
| Fresh startup | README commands start app; page loads | |
| Before answering | Bank advice, India 1930 and portal visible | |
| Payment example | Bank, official reporting and pause-payment actions | |
| Expand source | Relevant publisher link and rationale visible | |
| Click a link | Does not automatically mark action done; do not place a test call or submit a test complaint | |
| Mark organise-facts done | Progress increases by one | |
| Remote access -> Yes | Device action appears; organise-facts remains done | |
| Mark bank step done, UPI -> Card | Bank step remains but resets to not done | |
| Suspected fraud -> No | Fraud actions removed; ordinary support shown | |
| Suspected fraud -> Yes again | Previously removed steps do not regain marks | |
| Password example | Credential guidance despite no money moved | |
| Unknown example | Unknown stays unknown; clarification shown | |
| Country -> Another country | India urgent strip hidden; only scope guidance | |
| Empty amount vs zero | Export distinguishes unknown from 0.00 | |
| Negative amount | Invalid entry blocks assessment/export | |
| Notes contain angle brackets | Display/export as text, never executable HTML | |
| Download summary | Opens as text; current answers, source links and completion accurate | |
| Clear session during update | No old result returns | |
| Refresh | Form and progress reset | |
| 390px viewport | No horizontal scroll; controls usable | |
| Keyboard navigation | Controls reachable; visible focus and checkbox labels | |
| Stop server and request update | Error shown; stale checklist not usable as current | |
| Restart server, retry | Form answers retained and assessment works | |
| Internet disconnected after setup | Local checklist/export works; external reporting links understandably need network | |

Use only fictional details. Record screenshots of defects and exact terminal
errors. Repeat failed checks after fixes; keep a stable checkpoint available.
