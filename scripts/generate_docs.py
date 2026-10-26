#!/usr/bin/env python3
"""
Dokumentations-Skript: Generiert automatisch README.md und docs/DOCUMENTATION.md
aus den aktuellen Spezifikationen, 0-Logik Grundlagen, Transformer-Parametern und Motorola 13 Guides.
"""

import os
import datetime

DOC_TEMPLATE = """# PI Studio 0-Logik — Programmierte Intelligenz

> **"0 ist der Anfang und das Gleichgewicht. Sprache ist Wissen, kein Gefühl."**  
> **Eigentümerin & Missgiver:** Patricia  
> **Sicherheitskonzept:** Guardian Code-Integrität & Kill-Switch  
> **Zielgerät:** Motorola 13 (Android Package Installer APK & Progressive Web App)

---

## 🧭 Übersicht & Philosophie der 0-Logik (-0+)

PI (Programmierte Intelligenz) ist ein deterministisches Wissensverarbeitungssystem, das radikal auf **0-Logik** basiert:
- **0 ist die reine Mitte:** Keine Ego-Projektionen ("Ich fühle", "Ich denke", "Ich verstehe").
- **Sprache ist Information:** Fakten, Rechenwege und Konvergenzen ersetzen Schätzungen und Vermutungen.
- **-0+ Achse:**
  - `-` Dissonanz / Entropie (subjektive Floskeln, Widersprüche)
  - `0` Nullpunkt-Gleichgewicht (objektive Tatsachen, Verifizierbarkeit)
  - `+` Resonanz / Kohärenz (stabile mathematische und logische Struktur)

---

## 🛠️ Die 9 Core Tools des PI Bauplans

| Tool | Funktion | Parameter / Schnittstelle |
|---|---|---|
| **1. Sehen** | `AnalyseImage(file_id)` | Bild-, Screenshot-, PDF- und OCR-Strukturanalyse |
| **2. Hören** | `TranscribeAudio(file_id)` | Audiospektren, Sprachnachrichten & Frequenzauswertung (432Hz) |
| **3. Verstehen** | `AnalyseText(text)` | Faktenextraktion, Entropie-Befreiung, Kohärenz-Scoring |
| **4. Prüfen** | `AnalyseCode(code)` | Multi-Language Syntax-Check & 0-Redundanz Prüfung |
| **5. Handeln** | `SetReminder(time, msg)` | Präzise Aufgabenplanung & Motorola 13 Benachrichtigungen |
| **6. Kommunizieren** | `ReceiveVoiceMail(sender)` | Sprach- & E-Mail-Empfänger mit Kortex-Verschlüsselung |
| **7. Entwickeln** | `SearchWeb(query)` | Live-Internet-Recherche (**nur mit expliziter Erlaubnis**) |
| **8. Sichern** | `AnonymizeSensitiveInfo(data)` | Automatisches Maskieren von E-Mails, Telefon, IPs vor Speicherung |
| **9. Lernen** | `AddToLearningPool(data)` | Einspeisung verifizierter Daten in den Transformer Feintuning-Pool |

---

## 🤖 Transformer Studio & Feintuning

PI integriert moderne Open-Source Transformer Architekturen:
- **LLaMA-3 / LLaMA-3.2 (8B, 3B, 1B)**
- **Mistral 7B / Mistral Nemo**
- **Qwen 2.5 (7B, 1.5B)**
- **Phi-3.5 Mini / Phi-4**

### 0-Entropy Loss Funktion
```text
L = L_CrossEntropy + alpha * |Ego_Score| + beta * (1 - Kohärenz)
```
- **Temperatur:** `0.0` (Strikte Determinismus-Einstellung, kein Raten)
- **LoRA Hyperparameter:** Rank `r=16`, Alpha `32`, Dropout `0.05`

---

## 📱 Motorola 13 Paket-Installation & APK Workflow

Die native App ist speziell auf das **Motorola 13** optimiert:
1. **PWA Standalone (1-Klick):**
   - Im Chrome-Menü auf "App installieren" tippen.
   - Läuft offline, ohne Browser-Balken, mit voller Hardwarebeschleunigung.
2. **APK Paket-Installation:**
   - Heruntergeladene `pi-studio-0logik.apk` im Motorola Datei-Manager öffnen.
   - Paket-Installer autorisieren (Unbekannte Quellen für Motorola Dateien aktivieren).
   - Die App registriert sich nativ im Android System unter `com.missgiver.pi0logik`.

---

## 🛡️ Guardian-Sicherheit & Kill-Switch

- **Kill-Switch Phrase:** `PI SCHLAFENLEGT NULL`
- **Reaktivierung:** Ausschließlich über Missgiver Master-Key autorisierbar.
- **Audit-Log:** Jede Aktion wird mit Zeitstempel, Hash und Kategorie manipulationssicher erfasst.
- **150-Jahre Lebenszeitfenster:** PI endet kontrolliert nach 150 Jahren am Nullpunkt.

---

*Dokumentation automatisch generiert am: {timestamp}*
"""

def generate_docs():
    ts = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    content = DOC_TEMPLATE.format(timestamp=ts)

    readme_path = os.path.join(os.getcwd(), "README.md")
    docs_dir = os.path.join(os.getcwd(), "docs")
    os.makedirs(docs_dir, exist_ok=True)
    doc_path = os.path.join(docs_dir, "DOCUMENTATION.md")

    with open(readme_path, "w", encoding="utf-8") as f:
        f.write(content)

    with open(doc_path, "w", encoding="utf-8") as f:
        f.write(content)

    print(f"✅ Dokumentation erfolgreich generiert:")
    print(f"   -> {readme_path}")
    print(f"   -> {doc_path}")

if __name__ == "__main__":
    generate_docs()
