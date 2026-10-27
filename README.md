[Deutsch](README.md) · [Technical guide in English](README.en.md)

# Field Difference Lab · gleiche Ausgangslage, andere Regel

Was verändert sich, wenn dieselbe Bewegung unter einer anderen Modellregel
abläuft? Dieses Browserlabor stellt die Verläufe nebeneinander — zum Lernen,
Erklären und Prüfen eigener Modellannahmen.

[**Im Browser ausprobieren**](https://juri-halveth.github.io/halveth-field-difference-lab/) ·
[Gleichungen und Methoden](README.en.md) · [Quellcode](physics.js)

## Drei Experimente zum direkten Vergleichen

| Einstieg | Was sich verändern lässt | Was sichtbar wird |
| --- | --- | --- |
| Vier Welten | Die Regel für die Beschleunigung bei gleichem Start | Unterschiedliche Bahnen desselben Startzustands |
| Grenzübertritt | Die Feldregel rechts einer Grenze | Stetige Position und Geschwindigkeit bei wechselnder Beschleunigung |
| Softwarevergleich | Auswahl der ersten oder letzten gleichnamigen Eingabe | Unterschiedliche Ergebnisse aus denselben Eingabebytes |

Die Werte des Bewegungsmodells sind dimensionslos. Seine Gleichungen,
Gegenbeispiele und die Trennung vom Softwaremodell stehen in der
[technischen Anleitung](README.en.md#three-separate-experiments).

## Lokal in einer Minute

```sh
git clone https://github.com/Juri-Halveth/halveth-field-difference-lab.git
cd halveth-field-difference-lab
python -m http.server 8846 --bind 127.0.0.1
```

Danach [127.0.0.1:8846](http://127.0.0.1:8846/) öffnen. Die Berechnung läuft im
Browser; der Server liefert nur die lokalen Dateien. Für diese Vorschau keine
privaten Dateien im Projektordner ablegen.

## Das Ergebnis selbst prüfen

Mit Node.js: `npm test`. Zusätzliche npm-Pakete sind dafür nicht erforderlich.
Die Tests prüfen die implementierten Modellregeln: gleiche Anfangszustände,
Vorzeichenwechsel, den Grenzübertritt und die verschiedenen Softwareauswahlen.
Der Workflow **Source checks** führt diese Prüfung bei jedem PR und auf `main` aus.

Das ist ein ausführbares Modelllabor. Eine reale Messreihe ist ein eigener
nächster Schritt; [Methoden, Herkunft und weitere Experimente](README.en.md)
bleiben getrennt dokumentiert.

## Rechte und Zusammenarbeit

Originalmaterial steht unter [Apache-2.0](LICENSE). [NOTICE](NOTICE) und
[Projektidentität](PROJECT_IDENTITY.md) erhalten Herkunft und Zuordnung.

Zusammenarbeit: [juri@halveth.de](mailto:juri@halveth.de) ·
[Portfolio](https://juri-halveth.github.io/)
