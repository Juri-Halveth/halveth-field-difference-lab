# Feldlabor – Bewegung und Zustandswechsel sichtbar machen

Ein eigenständiges visuelles Modelllabor. Die Experimente vergleichen deklarierte Regeln und zeigen ihre Auswirkungen auf Bewegung und Darstellung.

[**Projekt öffnen →**](https://juri-halveth.github.io/halveth-field-difference-lab/) · [Arbeitsproben](https://juri-halveth.github.io/koennen/) · [Portfolio](https://juri-halveth.github.io/)


Standalone, local-first visual laboratory for the question: What changes when the same entity encounters a different field rule? The third panel translates the **question pattern** to a synthetic software representation boundary. Open `index.html` in a browser with ES module support. If local `file://` modules are blocked by the browser, serve this directory locally, for example `python -m http.server 8846 --bind 127.0.0.1` and open `http://127.0.0.1:8846/`.

**Project direction:** Juri Janovski / HALVETH. **License:** Apache-2.0 for the original content here. See [NOTICE](NOTICE) and [project identity](PROJECT_IDENTITY.md). This is a local model laboratory, not a target scanner.

## Three separate experiments

| Experiment | Entity and initial state | Field / rule | Boundary | Observation |
| --- | --- | --- | --- | --- |
| Four worlds | Point mass, `r=(1,0)`, `v=(0,0.72)` | `a=-(1-κ) μ r/(r²+ε²)^(3/2)`, `μ=1`, `ε=0.05`; `κ ∈ {0,0.5,1,1.4}` | Parameter choice between independent runs | Different trajectories from the same seed; `κ=1` preserves inertial motion |
| Crossing | Point mass, `r=(-2,1.3)`, `v=(0.65,0.7)` | Piecewise uniform vertical field `a_y=-g(1-κ(x))`, `g=0.45`, `κ_left=0`, adjustable `κ_right` | `x=0` | Position and velocity continuous, acceleration rule changes |
| Software boundary | Synthetic string, e.g. `color=blue&color=red` | One browser parser, two explicit selection rules: first value and last value | Choice of rule | Value may differ; target, authority and impact remain unbound |

All values are dimensionless. These equations are **different model families**. The central field uses a softened denominator to keep the simulated force finite near the origin; it is not exactly Newtonian at small radius. Integration uses velocity Verlet with `dt=0.01`. The crossing model uses an exact piecewise analytic trajectory for its declared assumptions. The white arrow is the current acceleration direction, with capped display length; it is not a force-magnitude scale.

`κ=1` cancels acceleration in the central model. With the declared nonzero initial velocity, the object travels in a straight line. The word “levitation” would require an additional frame, boundary and stationary-state specification. `κ>1` denotes a counterfield term intentionally inserted into these equations; the lab does not claim a measured gravitational repulsion, a practical levitation device, antimatter behavior or Marvel-style Gravitonium.

## Run the model checks

```powershell
npm test
```

The checks cover zero acceleration with retained velocity, radial sign change around `κ=1`, identical initial states, continuous position and velocity at the boundary, and the three declared synthetic software outcomes. They validate the declared model implementation, not physical reality or a real security vulnerability.

The [security adapter](SECURITY_ADAPTER.md) defines the evidence path from local delta to a real, authorized case. Its downloadable JSON remains a synthetic model receipt. It is an **offline file bridge**, not a network tunnel or live GitHub/bounty-platform connector.

The separate [interactive Zuse grid research room](zuse.html) turns a historical question about direction-dependent propagation on a Cartesian grid into an isolated, tested two-rule comparison. The [model note](ZUSE_GRID_MODEL.md) binds its assumptions, measurements, historical sources and claim ceiling. It does not change the three original browser experiments or assert a physical result.

## Runtime and accessibility

The model calculations and synthetic text comparison run in the browser. Visiting the GitHub Pages site initially needs a network connection; the site does not install an offline cache. Animation drawing is capped at 30 frames per second, pauses when the page is hidden and stops requesting frames when paused. The system's reduced-motion preference starts the laboratory paused. Tabs support Left/Right, Home and End keys; the selected tab remains the one normal Tab stop. The mobile layout stacks comparison rails and uses 16-pixel input text to avoid automatic focus zoom on common phones.

## Provenance and next discriminating experiment

- Source idea: user-provided HALVETH / Gravitonium / Field Difference Lab sketch in the current conversation, 2026-10-19.
- This is a new, isolated artifact. It does not modify other HALVETH projects or their histories.
- Next physical comparison: select a *specific* real levitation mechanism (for example magnetic or acoustic), bind source, geometry, energy input, units and measured trajectories, then compare it against the simplified counterfield prediction. A different prediction must be named before evaluating data.
- Next software comparison: use the same typed **question structure** (source, boundary, transformation, observed delta) for parser or network cases, while keeping their domain-specific mechanisms and authorization separate.
