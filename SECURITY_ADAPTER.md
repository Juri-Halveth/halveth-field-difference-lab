# Security adapter: from a visible delta to a testable case

## What the working example does

The third panel uses one **caller-supplied, synthetic string** such as `color=blue&color=red`. Both rails use the browser's `URLSearchParams` parser. The left rail selects the first value for `color`; the right rail selects the last. The local result is `DIVERGENT_SELECTION`. This proves a difference **between these two declared selection rules** for this input. It does not prove that two real components use those rules or that any protected decision changes.

The panel exports a local JSON receipt with the exact input, key, two operator IDs, output values, model version, result, and claim ceiling. The panel sends no request to a target, GitHub or a bounty platform. The GitHub workflow publishes only the static source files. Do not place real tokens, private requests or customer data into its free-text box or commit exported receipts containing such material.

## Why it can help a bug-bounty investigation

| Research edge | Required evidence before moving further |
| --- | --- |
| Same logical input reaches both components | Exact entrypoint, transport, parser, source revision and test authority |
| Components interpret it differently | Version-bound A/B observation with raw input, operator, output type and order |
| Different interpretation reaches a protected consumer | Bound consumer code/runtime and selected value |
| Different value changes authority | Authorized session/identity/capability transition, not just a string mismatch |
| A protected effect occurs | Smallest safe, program-compliant observation of impact |

The current lab only reaches the **local selection-rule edge**. An actual case needs its own scope, target, owner, policy, test identity, stop condition, data boundary, source version and evidence journal. No blanket authorization transfers from this demo to a third-party service.

## Integration seam

`security-model.js` exports `evaluateSyntheticQuery(raw, key)`, a deterministic browser/Node function. `security-model.test.mjs` exercises the declared outcome classes. The JSON export can be read by a separate authorized case tool as **candidate model data**. The receiving tool must preserve the source and cannot promote `LOCAL_RULE_DIFFERENCE_ONLY` to a vulnerability or impact claim.

Future adapters can supply independently versioned observations for parsers, signed representations, sessions or protocol boundaries. Each adapter needs its own typed input/output contract, authority scope and test oracle. Physical-field outputs remain a separate domain; the bridge between them is a research question pattern, not physical equivalence.

## Finite research state

- `PROVEN`: deterministic local selection-rule difference for the declared synthetic input and model version.
- `FALSIFIED`: a single value or repeated equal values do not create a first/last selection delta under this model.
- `DEEPEST_UNKNOWN`: whether any authorized real target has the same two rules in a path to a protected consumer.
- `COUNTERHYPOTHESIS`: both real components use the same selection rule, or the input is rejected upstream.
- `NEXT_SAFE_EXPERIMENT`: source-bound, read-only A/B trace in an owned or program-authorized test environment.
- `STOP_CONDITION`: stop before live target requests, credentials, protected data, authority exercise, service impact or publication until exact scope and authority are bound.
- `REOPEN_TRIGGER`: a concrete owner/program policy plus version-bound source or owned test fixture identifying the two components and their consumer.
