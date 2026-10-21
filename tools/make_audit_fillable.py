#!/usr/bin/env python3
"""Turn docs/HCM_Academy_Topic_Audit.pdf into a fillable form: clickable checkboxes and text fields
placed at hidden position markers (QB = checkbox, QA/QZ = start/end of a note line), then remove the markers.
  python3 tools/build_topic_audit.py && node tools/render_topic_audit.cjs && python3 tools/make_audit_fillable.py
Requires PyMuPDF (pip install pymupdf)."""
import json, os, re
import fitz  # PyMuPDF
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PDF = os.path.join(ROOT, "docs", "HCM_Academy_Topic_Audit.pdf")
names = json.load(open(os.path.join(ROOT, "docs", "audit", "fields.json")))
LABEL = {"K": "Keep", "C": "Change", "R": "Remove", "M": "Merge", "A": "Right topic", "B": "Rename", "D": "Missing subtopics"}
SIGN = {"S1": "Reviewer", "S2": "Area or role", "S3": "Date"}
doc = fitz.open(PDF)
n_box = n_txt = 0
for page in doc:
    words = page.get_text("words")
    toks = {}
    for w in words:
        found = re.findall(r"Q[ABZ](?:C\d{3}[KCRMN]|T\d{2}[ABCDN]|S\d)", w[4])
        for i, t in enumerate(found):   # markers can run together into one "word"; keep the first one's position
            toks.setdefault(t, fitz.Rect(w[:4]) if i == 0 else None)
    for tok, r in toks.items():
        kind, fid = tok[1], tok[2:]
        if r is None: continue
        if kind == "B":
            # checkbox: the marker sits at the box's top-left; the drawn box is about 9 CSS px (6.75 pt) square
            w = fitz.Widget(); w.field_type = fitz.PDF_WIDGET_TYPE_CHECKBOX
            w.rect = fitz.Rect(r.x0 - .1, r.y0 - .1, r.x0 + 7.3, r.y0 + 7.3)
            if fid.startswith("T"):
                topic = fid[1:3]; opt = fid[3]
                w.field_name = f"Topic {topic} {LABEL['C' if opt == 'C' else opt] if opt != 'C' else 'Reorder'}"
                w.field_label = f"{names.get('T' + topic, '')}: {w.field_name.split(' ', 2)[2]}"
            else:
                cid, opt = fid[:4], fid[4]
                w.field_name = f"{cid} {LABEL[opt]}"; w.field_label = f"{names.get(cid, cid)}: {LABEL[opt]}"
            w.border_width = 0; w.field_value = False
            page.add_widget(w); n_box += 1
        elif kind == "A":
            end = toks.get("QZ" + fid)
            if end is None: end = fitz.Rect(r.x0, r.y0, r.x0 + 130, r.y1)   # markers merged: use the line's width
            w = fitz.Widget(); w.field_type = fitz.PDF_WIDGET_TYPE_TEXT
            merge = fid.startswith("C") and fid.endswith("M")
            h = 20 if fid.startswith("S") else (9.5 if merge else 14)
            w.rect = fitz.Rect(r.x0, r.y0 + (-1 if merge else 1), end.x1, r.y0 + h)
            if fid.startswith("S"): w.field_name = SIGN[fid]; w.field_label = SIGN[fid]
            elif fid.startswith("T"): w.field_name = f"Topic {fid[1:3]} Notes"; w.field_label = f"{names.get('T' + fid[1:3], '')}: topic notes"
            elif merge: w.field_name = f"{fid[:4]} Merge with"; w.field_label = f"{names.get(fid[:4], fid[:4])}: merge with which topic"
            else: w.field_name = f"{fid[:4]} Notes"; w.field_label = f"{names.get(fid[:4], fid[:4])}: notes"
            w.text_fontsize = 8 if not fid.startswith("S") else 10; w.text_font = "Helv"; w.border_width = 0
            if merge: w.text_fontsize = 7.5
            w.field_flags |= fitz.PDF_TX_FIELD_IS_MULTILINE if not (fid.startswith("S") or merge) else 0
            page.add_widget(w); n_txt += 1
    for r in [r for r in toks.values() if r is not None]:
        page.add_redact_annot(fitz.Rect(r.x0 + .05, r.y0 + .05, r.x1 - .05, r.y1 - .05))
    page.apply_redactions(images=fitz.PDF_REDACT_IMAGE_NONE, graphics=fitz.PDF_REDACT_LINE_ART_NONE)
    for w in page.get_text("words"):   # sweep any marker fragments left at a page edge
        if re.match(r"Q[ABZ]", w[4]): page.add_redact_annot(fitz.Rect(w[:4]))
    page.apply_redactions(images=fitz.PDF_REDACT_IMAGE_NONE, graphics=fitz.PDF_REDACT_LINE_ART_NONE)
doc.save(PDF + ".tmp", garbage=3, deflate=True); doc.close(); os.replace(PDF + ".tmp", PDF)
print(f"fillable: {n_box} checkboxes, {n_txt} text fields")
