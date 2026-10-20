# Zuse grid question — a bounded software experiment

Konrad Zuse's 1967 article ["Rechnender Raum" (reprinted by *Spektrum der Wissenschaft*)](https://www.spektrum.de/pdf/rechnenderraum-pdf/1030307?file=) discusses how a pulse advancing across four neighbours of a Cartesian grid can acquire preferred directions. We use that historical **question** to test whether a local model's observation depends on the chosen representation. The [Konrad Zuse Internet Archive index](https://zuse.zib.de/pdfs) also lists earlier notes on program storage, cellular automata and the computing space; their titles are metadata, not a specification of this implementation.

The [Deutsches Museum's finding aid for Zuse's papers](https://www.deutsches-museum.de/assets/Forschung/Archiv/Download/Findbuecher_PDF/NL_207_Zuse.pdf) records a 25 February 1956 patent application for a machine calculating over grid-arranged field values (patent no. 1122748, granted 25 January 1962). This is specific historical prior work on grid calculations. The finding aid alone does not establish that its hardware, update rule or output is equivalent to the experiment below.

`experiments/zuse-lattice.mjs` defines our own bounded model. One unit begins at `(0,0)`. At each integer step, each occupied cell passes one quarter of its value north, south, east and west. The state is a map from integer coordinates to values. The experiment is deterministic and conserves total value within floating-point tolerance; it has no physical units.

Run the checks with `npm test`. For four steps, the occupied frontier reaches radius `4` on the axes and `√8` on a diagonal. Yet its second moments are equal: `E[x²] = E[y²] = 2`. A summary statistic can therefore look symmetric while the frontier still depends on direction. The test checks that *declared model*, not the structure of the physical universe.

The comparison needed for a stronger research claim is a second, separately specified propagation rule, run with the same seed, horizon, normalization and observable. Any comparison with measured physics would additionally require an instrument, units, calibration, competing predictions and uncertainty. This code makes no claim about actual spacetime, gravity, digital particles or an exploitable security defect.

The code and this explanation are new original work licensed under this repository's Apache-2.0 license. The archive's [terms of use](https://zuse.zib.de/tou) generally specify CC BY-NC-SA 3.0 and note possible third-party rights; no archive PDF, image or long excerpt is copied into this repository.
