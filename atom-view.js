// Copyright 2026 Juri Janovski. SPDX-License-Identifier: Apache-2.0
import { binaryStep, STAGES, starStage } from "./atom-model.js";

const byId = (id) => document.getElementById(id);
const numberSelect = byId("start-z");
const stageSlider = byId("stage-slider");
const svg = byId("star-schematic");
const svgNS = "http://www.w3.org/2000/svg";
const stageKindNames = {
  PHYSICAL_EVENT: "EREIGNIS",
  MEASUREMENT: "MESSUNG",
  INFERENCE: "REKONSTRUKTION",
  RENDERING: "DARSTELLUNG",
  SECONDARY_CLAIM: "SPÄTERER CLAIM",
};

function svgNode(name, attributes, parent) {
  const node = document.createElementNS(svgNS, name);
  for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, String(value));
  parent.appendChild(node);
  return node;
}

function position(radius, angle) {
  return { x: 310 + radius * Math.cos(angle), y: 310 + radius * Math.sin(angle) };
}

function prepareSchematic() {
  const scaffold = svgNode("g", { "data-part": "scaffold" }, svg);
  for (let i = 0; i < 12; i++) {
    const a = (Math.PI * 2 * i) / 12 - Math.PI / 12;
    const b = (Math.PI * 2 * (i + 1)) / 12 - Math.PI / 12;
    const p = position(282, a);
    const q = position(282, b);
    svgNode("line", { x1: p.x, y1: p.y, x2: q.x, y2: q.y, class: "outer-ring" }, scaffold);
  }
  for (const radius of [93, 142, 204, 250]) {
    svgNode("circle", { cx: 310, cy: 310, r: radius, class: "inner-ring" }, scaffold);
  }
  svgNode("line", { x1: 35, y1: 310, x2: 585, y2: 310, class: "axis" }, scaffold);
  svgNode("line", { x1: 310, y1: 35, x2: 310, y2: 585, class: "axis" }, scaffold);

  const beam = svgNode("g", { "data-part": "beam" }, svg);
  svgNode("line", { x1: 110, y1: 310, x2: 285, y2: 310, class: "beam" }, beam);
  svgNode("line", { x1: 510, y1: 310, x2: 335, y2: 310, class: "beam" }, beam);
  svgNode("circle", { cx: 110, cy: 310, r: 21, class: "ion" }, beam);
  svgNode("circle", { cx: 510, cy: 310, r: 21, class: "ion" }, beam);
  for (const x of [110, 510]) {
    const t = svgNode("text", { x, y: 314, "text-anchor": "middle", class: "label" }, beam);
    t.textContent = "Au";
  }

  const tracks = svgNode("g", { "data-part": "tracks" }, svg);
  const hits = svgNode("g", { "data-part": "hits" }, svg);
  const colors = ["#7ce9ee", "#3289e8", "#76bfee", "#d458c8", "#9ee7bd"];
  for (let i = 0; i < 116; i++) {
    const angle = ((Math.PI * 2) / 116) * i + Math.sin(i * 2.31) * 0.016;
    const begin = position(96 + (i % 7) * 2.5, angle);
    const end = position(220 + (i % 9) * 5.2, angle + Math.sin(i * 1.77) * 0.052);
    const bend = position(165 + (i % 6) * 4, angle + Math.sin(i * 1.13) * 0.08);
    svgNode("path", {
      d: "M " + begin.x.toFixed(2) + " " + begin.y.toFixed(2) +
        " Q " + bend.x.toFixed(2) + " " + bend.y.toFixed(2) +
        " " + end.x.toFixed(2) + " " + end.y.toFixed(2),
      class: "track",
      stroke: colors[i % colors.length],
    }, tracks);
    svgNode("circle", { cx: end.x.toFixed(2), cy: end.y.toFixed(2), r: i % 4 === 0 ? 2.5 : 1.7, class: "hit" }, hits);
  }

  svgNode("circle", { cx: 310, cy: 310, r: 78, class: "center" }, svg);
  svgNode("circle", { cx: 310, cy: 310, r: 55, class: "zero-ring" }, svg);
  svgNode("circle", { cx: 310, cy: 310, r: 26, class: "zero-ring" }, svg);
  const centerLabel = svgNode("text", { x: 310, y: 315, "text-anchor": "middle", class: "label" }, svg);
  centerLabel.textContent = "STAR";
  const caption = svgNode("g", { "data-part": "caption" }, svg);
  svgNode("rect", { x: 88, y: 510, width: 444, height: 53, rx: 6, class: "display-claim" }, caption);
  const claim = svgNode("text", { x: 310, y: 541, "text-anchor": "middle", class: "caption" }, caption);
  claim.textContent = "2026 · VIRALER TITEL ≠ ORIGINALMESSUNG";
}

function updateNumber() {
  const state = binaryStep(Number(numberSelect.value));
  byId("before-binary").textContent = state.beforeBinary;
  byId("after-binary").textContent = state.afterBinary;
  byId("before-element").textContent = state.beforeZ + " · " + state.beforeName;
  byId("after-element").textContent = state.afterZ + " · " + state.afterName;
  byId("matter-before").textContent = "Z = " + state.beforeZ;
  byId("matter-after").textContent = "Z = " + state.afterZ;
  byId("number-result").textContent = state.beforeZ + " × 2 = " + state.afterZ + ". Die Zahl und ihre Einordnung ändern sich.";
  byId("matter-result").textContent = "Der bezeichnete Atomkern wurde nicht umgewandelt. Für Z = " + state.afterZ + " fehlt hier eine definierte Reaktion mit Messbeleg.";
}

function answerQuestion(choice) {
  const result = binaryStep(Number(numberSelect.value));
  for (const button of document.querySelectorAll("[data-answer]")) {
    button.setAttribute("aria-pressed", String(button.dataset.answer === choice));
  }
  const feedback = byId("learning-feedback");
  if (choice === "number") {
    feedback.textContent = "Genau: Aus " + result.beforeZ + " wird als Zahl " + result.afterZ + ". Im Rechner ändern sich Speicherzustände; der bezeichnete Atomkern wird dadurch nicht umgewandelt.";
  } else if (choice === "nucleus") {
    feedback.textContent = "Der bezeichnete Kern wurde hier nicht umgewandelt. Der Operator ändert die Binärdarstellung in einem physischen Rechner.";
  } else {
    feedback.textContent = "Die Zahl und ihre Einordnung wechseln. Eine Umwandlung des bezeichneten Atomkerns wurde nicht ausgeführt oder gemessen.";
  }
}

function populateStageButtons() {
  const list = byId("stage-steps");
  STAGES.forEach((item, index) => {
    const li = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = String(index + 1).padStart(2, "0");
    button.setAttribute("aria-label", "Schritt " + (index + 1) + ": " + item.title);
    button.addEventListener("click", () => {
      stageSlider.value = String(index);
      updateStage();
    });
    li.appendChild(button);
    list.appendChild(li);
  });
}

function updateStage() {
  const index = Number(stageSlider.value);
  const item = starStage(index);
  stageSlider.setAttribute("aria-valuetext", (index + 1) + " von " + STAGES.length + ": " + item.title);
  byId("stage-date").textContent = item.date;
  byId("stage-kind").textContent = stageKindNames[item.kind] || item.kind;
  byId("stage-title").textContent = item.title;
  byId("stage-description").textContent = item.description;
  byId("stage-claim").textContent = item.claim;
  byId("stage-count").textContent = (index + 1) + " / " + STAGES.length;
  byId("visual-phase").textContent = String(index + 1).padStart(2, "0") + " / " + String(STAGES.length).padStart(2, "0");
  byId("stage-prev").disabled = index === 0;
  byId("stage-next").disabled = index === STAGES.length - 1;
  svg.setAttribute("data-phase", String(index));
  svg.setAttribute("aria-label", "Schematische Darstellung, Schritt " + (index + 1) + ": " + item.title + ". Keine Originaldaten.");
  for (const [i, button] of Array.from(byId("stage-steps").querySelectorAll("button")).entries()) {
    if (i === index) button.setAttribute("aria-current", "step");
    else button.removeAttribute("aria-current");
  }
}

numberSelect.addEventListener("change", () => {
  updateNumber();
  for (const button of document.querySelectorAll("[data-answer]")) button.setAttribute("aria-pressed", "false");
  byId("learning-feedback").textContent = "Wähle eine Aussage und vergleiche sie mit beiden Spuren.";
});
for (const button of document.querySelectorAll("[data-answer]")) {
  button.addEventListener("click", () => answerQuestion(button.dataset.answer));
}
stageSlider.addEventListener("input", updateStage);
byId("stage-prev").addEventListener("click", () => {
  stageSlider.value = String(Math.max(0, Number(stageSlider.value) - 1));
  updateStage();
});
byId("stage-next").addEventListener("click", () => {
  stageSlider.value = String(Math.min(STAGES.length - 1, Number(stageSlider.value) + 1));
  updateStage();
});

prepareSchematic();
populateStageButtons();
updateNumber();
updateStage();
