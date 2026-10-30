# Atom, Null und Materie · Modellvertrag und Quellen

Dieser Forschungsraum vergleicht drei verschiedenartige Operationen: eine Änderung der **Zahlendarstellung**, eine hypothetische Änderung eines **materiellen Zustands** und die **Rekonstruktion eines Detektorereignisses**. Gleiche Bildform oder gleiche Zahl begründen keine Identität zwischen diesen Ebenen.

## A · Binäre Darstellung

Für eine positive ganze Zahl `n` ist das Anhängen der Ziffer `0` an ihre kanonische Binärschreibweise gleich `2n`. Im Beispiel gilt:

```text
32 = 100000₂  →  1000000₂ = 64
```

Die Periodentafel ordnet `Z=32` Germanium (`Ge`) und `Z=64` Gadolinium (`Gd`) zu. `Z` ist die Anzahl der Protonen eines Atomkerns. Das beschriebene Anhängen verändert den **Bitstring und seine Interpretation**, nicht den dadurch bezeichneten Kern. Die Berechnung selbst läuft auf physischer Hardware ab und verändert dort elektrische beziehungsweise Speicherzustände. Die Grenze betrifft das **referenzierte Objekt**, nicht jede Materie überhaupt. Quelle für Elementnamen und Ordnungszahlen: [IUPAC-Periodensystem](https://iupac.org/what-we-do/periodic-table-of-elements/).

## B · Materieller Zustand

Ein Zustand eines Atoms oder Kerns ist durch die Ordnungszahl allein nicht vollständig beschrieben. Für eine reale Übergangsbehauptung wären mindestens Protonenzahl `Z`, Neutronenzahl `N`, Ladung, Anfangs- und Endzustand, Reaktionspfad, Energie- und Erhaltungsbilanz, Umgebung, Zeit, Messmethode und Beleg nötig. Dieses Labor **simuliert keine Kernreaktion** und zeichnet aus dem Bitoperator keine physikalische Umwandlung ab. Die fehlende Brücke bleibt sichtbar.

Die Kernphysik kennt besondere Schalenabschlüsse, oft „magische Zahlen“ genannt. Diese werden aus Kernstruktur und Messungen untersucht; die Folge der Zweierpotenzen im Binärbeispiel ist nicht dieselbe Hypothese. Ein Einstieg: [APS Physics, Exposing Nuclear Magic](https://physics.aps.org/articles/v19/11).

## C · Bild als rekonstruiertes Ereignis

Brookhaven beschriftet eine vielfach als „Atomfoto“ geteilte radiale Grafik als **Endansicht einer Goldionenkollision im STAR-Detektor**. Die farbigen Spuren sind eine Visualisierung von Kollisionsprodukten, kein direktes Bild der Elektronenbahnen eines Einzelatoms. Das dunkle Zentrum gehört zur Detektor- und Projektionsgeometrie der Ansicht; daraus folgt keine Substanz namens „Null“. Für die exakte Bedeutung jeder Farbe dieses historischen Bildes liegt hier keine gebundene Legende vor.

Quellen:

- [Brookhaven National Laboratory, Originalkontext vom 13. Juni 2000](https://www.bnl.gov/newsroom/news.php?a=111052)
- [US Department of Energy, Beschreibung der STAR-Endansicht und des Rückschlusses aus Kollisionsprodukten](https://www.energy.gov/science/articles/quarter-century-surprises-exploring-quark-gluon-plasma)
- [CERN, wie Detektorsignale zu rekonstruierten Teilchenspuren werden](https://home.cern/how-detector-works)

Die Darstellung auf `atom.html` ist eine **eigene schematische Lehrgrafik**. Sie übernimmt keine Bilddatei von Brookhaven, DOE oder einem sozialen Netzwerk und beansprucht keine Übereinstimmung mit Rohdaten oder den genauen Farben eines STAR-Ereignisses. Der Quellenweg lautet: Kollision → Detektorsignal → rekonstruiertes Ereignis → Projektion → Deutung. Nur die ersten drei Quellen begründen Aussagen über das historische Bild; die browserseitige Grafik erklärt den Unterschied der Ebenen.

## Aussagegrenze und nächster Test

Die JavaScript-Tests prüfen den deklarierten Zahlenoperator und das Paket der ausgelieferten Website-Dateien. Die Benutzeroberfläche wurde zusätzlich lokal im Browser auf Desktop- und Smartphone-Breite geprüft: Auswahl, Grenzfall `Z=128`, Zeitleiste, Rückmeldung, horizontale Breite und Laufzeitfehler. Diese Prüfungen belegen keine materielle Umwandlung, kein neues Element, keine unabhängige Aufnahme des Ereignisses und keine unbekannten „Steine“. Popkultur kann einen fiktionalen Entwurfsraum eröffnen. Eine reale Fundbehauptung benötigte eine benannte Probe mit Herkunft, Materialanalyse und überprüfbarer Messkette.

Ein unterscheidender Lerncheck für ein zukünftiges HALVETH-Modell wäre: Kann es aus neuen Beispielen selbst sagen, **welche Operation nur Zeichen verändert, welche eine reale Zustandsänderung beansprucht und welche ein Messbild interpretiert**? Diese Seite ist ein Quellenhinweis, keine automatisch zugelassene Trainingseingabe.

Projektleitung: Juri Janovski / HALVETH. Neue lokale Website-Dateien folgen der Apache-2.0-Lizenz dieses Repositories; verlinkte Quellen und Fremdbilder behalten ihre jeweiligen Rechte.
