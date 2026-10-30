[Deutsch](README.md) · [Technical guide in English](README.en.md)

# Field Difference Lab · gleiche Ausgangslage, andere Regel

Was verändert sich, wenn dieselbe Bewegung unter einer anderen Modellregel
abläuft? Dieses Browserlabor stellt die Verläufe nebeneinander — zum Lernen,
Erklären und Prüfen eigener Modellannahmen. Die Startseite enthält drei
Experimente; zwei eigenständige Forschungsräume vertiefen andere Fragen.

[**Im Browser ausprobieren**](https://juri-halveth.github.io/halveth-field-difference-lab/) ·
[Gleichungen und Methoden](README.en.md) · [Quellcode](physics.js)

## Drei Experimente auf der Startseite

| Einstieg | Was sich verändern lässt | Was sichtbar wird |
| --- | --- | --- |
| Vier Welten | Die Regel für die Beschleunigung bei gleichem Start | Unterschiedliche Bahnen desselben Startzustands |
| Grenzübertritt | Die Feldregel rechts einer Grenze | Stetige Position und Geschwindigkeit bei wechselnder Beschleunigung |
| Softwarevergleich | Auswahl der ersten oder letzten gleichnamigen Eingabe | Unterschiedliche Ergebnisse aus denselben Eingabebytes |

## Zwei eigenständige Forschungsräume

| Raum | Frage | Nachweisgrenze |
| --- | --- | --- |
| [Atom, Null und Materie](atom.html) | Was ändert das Anhängen einer binären Null, und was wäre für eine reale Materialänderung nötig? | Der Zahlenoperator ändert eine Repräsentation. Die STAR-Grafik zeigt eine rekonstruierte Goldionenkollision, kein Einzelatom. [Modell und Quellen](ATOM_NULL_MODEL.md) |
| [Zuse-Gitterforschung](zuse.html) | Wie verhalten sich zwei gesetzte Ausbreitungsregeln auf einem Gitter? | Das ausführbare Gittermodell ist keine Messung einer neuen Naturkraft. [Modellvertrag](ZUSE_GRID_MODEL.md) |

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

Wenn nur unformatierter Text erscheint oder die vier Bahnen fehlen, ist die
Vorschau unvollständig geladen. Prüfe `http://127.0.0.1:8846/style.css`,
`http://127.0.0.1:8846/app.js`, `http://127.0.0.1:8846/physics.js` und
`http://127.0.0.1:8846/security-model.js`: Jeder Abruf muss die entsprechende
Datei mit HTTP 200 liefern. Starte den Server bei Bedarf nach dem `cd` im
Projektordner neu und lade die Laborseite erneut.

## Das Ergebnis selbst prüfen

Mit Node.js: `npm test`. Zusätzliche npm-Pakete sind dafür nicht erforderlich.
Die Prüfung des Website-Pakets verwendet Bash; unter Windows ist das Git Bash.
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
