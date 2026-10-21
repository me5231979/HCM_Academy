#!/usr/bin/env python3
"""Build docs/HCM_Academy_Section_Audit.xlsx: reviewers sign up for a section, then audit that section.
Sheets: Start here, Sign-up, one sheet per section (00 to 07), Summary. Run: python3 tools/build_section_audit.py"""
import html, os, re, sys
from openpyxl import Workbook
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.formatting.rule import CellIsRule, FormulaRule
from openpyxl.worksheet.datavalidation import DataValidation
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from course_content import COURSES, VERIFY  # noqa: E402
ROOT = os.path.dirname(HERE)
SITE = "https://me5231979.github.io/HCM_Academy/"
BLACK, GOLD, OAK, CREAM, SAND = "1C1C1C", "CFAE70", "6B4F17", "F5F3EF", "E0D5C0"
BY = {c["slug"]: c for c in COURSES}

# sections and their course topics, in landing page order
landing = open(os.path.join(ROOT, "index.html"), encoding="utf-8").read()
SECTIONS = []
for m in re.finditer(r'<section class="card[^"]*" id="([a-z]+)" data-short="([^"]*)">(.*?)</section>', landing, re.S):
    cid, short, body = m.groups()
    sec = dict(no=re.search(r'<span class="no"[^>]*>(\d+)</span>', body).group(1), name=html.unescape(re.search(r"<h3>(.*?)</h3>", body).group(1)),
               short=html.unescape(short), rows=[])
    sub = ""
    for part in re.split(r'(<h4 class="subhead">.*?</h4>)', body):
        h = re.match(r'<h4 class="subhead">(.*?)</h4>', part)
        if h: sub = html.unescape(h.group(1)); continue
        for li in re.finditer(r'<li([^>]*)><span class="nm"><span class="tt">(.*?)</span>.*?Time: </span>([^<]*)', part, re.S):
            attrs, title, tm = li.group(1), html.unescape(li.group(2)), li.group(3)
            if "data-see" in attrs or "data-assess" in attrs: continue
            slug = (re.search(r'data-course="([^"]+)"', attrs) or [None, None])[1]
            sec["rows"].append(dict(sub=sub, title=title, slug=slug, time=tm))
    SECTIONS.append(sec)

def source_of(slug):
    if not slug: return "No content yet"
    return "Oracle docs, pending SME review" if BY[slug].get("pending", "").startswith("Built from Oracle") else "Vanderbilt SME sources"

def open_items(c):
    items = [w.replace("Open item: ", "") for w in c["watch"] if w.startswith("Open item")] + VERIFY.get(c["slug"], [])
    seen, out = [], []
    for i in items:
        k = i.lower().strip(" .")
        if not any(k in x or x in k for x in seen): seen.append(k); out.append(i[0].upper() + i[1:])
    return "\n".join(f"- {i}" for i in out)

wb = Workbook()
thin = Side(style="thin", color=SAND); BORDER = Border(left=thin, right=thin, top=thin, bottom=thin)
HEAD = (PatternFill("solid", fgColor=BLACK), Font(name="Arial", bold=True, color=GOLD, size=10))
INPUT = PatternFill("solid", fgColor="FFFDF7"); PRE = PatternFill("solid", fgColor=CREAM)
WRAP = Alignment(wrap_text=True, vertical="top"); F = lambda **k: Font(name="Arial", size=10, **k)

L = wb.active; L.title = "Lists"
LISTS = {"A": ["Keep", "Change", "Remove", "Merge"], "B": ["Accurate", "Needs change", "Wrong", "Not reviewed"], "C": ["High", "Medium", "Low"],
         "D": ["Open", "In progress", "Done", "Won't change"], "E": ["Not started", "In progress", "Done"],
         "F": ["Right as is", "Rename", "Reorder", "Missing subtopics", "Split", "Merge with another section"]}
for col, vals in LISTS.items():
    for i, v in enumerate(vals, 1): L[f"{col}{i}"] = v
REF = {k: f"=Lists!${k}$1:${k}${len(v)}" for k, v in LISTS.items()}

def header(ws, cols):
    for i, (name, width) in enumerate(cols, 1):
        c = ws.cell(row=1, column=i, value=name); c.fill, c.font = HEAD; c.alignment = Alignment(wrap_text=True, vertical="center")
        ws.column_dimensions[c.column_letter].width = width
    ws.row_dimensions[1].height = 34; ws.freeze_panes = "C2"

def style_rows(ws, cols, inputs, first, last):
    for r in range(first, last + 1):
        for i, (name, _) in enumerate(cols, 1):
            c = ws.cell(row=r, column=i); c.border = BORDER; c.alignment = WRAP
            if c.font is None or not c.font.underline: c.font = F()
            c.fill = INPUT if name in inputs else PRE

def dropdown(ws, cols, name, ref, first, last):
    col = [c[0] for c in cols].index(name) + 1; L_ = ws.cell(row=1, column=col).column_letter
    dv = DataValidation(type="list", formula1=ref, allow_blank=True, showErrorMessage=True, error="Pick a value from the list.")
    ws.add_data_validation(dv); dv.add(f"{L_}{first}:{L_}{last}"); return L_

def sheet_name(sec): return f'{sec["no"]} {sec["short"]}'[:31].replace("&", "and")

# Section sheets
SEC_COLS = [("#", 5), ("Subtopic", 18), ("Course topic", 34), ("Course status", 12), ("Source", 22), ("Link", 9), ("Time", 8),
            ("Open items to confirm", 44), ("Reviewer", 14), ("Decision", 12), ("Merge with", 24), ("Steps accurate?", 14),
            ("Job aid OK?", 13), ("Quiz OK?", 13), ("Notes or changes needed", 50), ("Priority", 10), ("PCB status", 12), ("PCB response", 34)]
SEC_IN = {"Reviewer", "Decision", "Merge with", "Steps accurate?", "Job aid OK?", "Quiz OK?", "Notes or changes needed", "Priority"}
for sec in SECTIONS:
    ws = wb.create_sheet(sheet_name(sec)); header(ws, SEC_COLS)
    for i, r in enumerate(sec["rows"], 1):
        c = BY.get(r["slug"]) if r["slug"] else None
        ws.append([i, r["sub"] or sec["name"], r["title"], "Live" if c else "Coming soon", source_of(r["slug"]), "", r["time"],
                   open_items(c) if c else "Needs a source: SME session, guide, or recording.", "", "", "", "", "", "", "", "", "Open", ""])
        if c:
            cell = ws.cell(row=i + 1, column=6, value="Open"); cell.hyperlink = SITE + f"courses/{c['slug']}/"
    n = len(sec["rows"]); sec["n"] = n; sec["sheet"] = ws.title
    style_rows(ws, SEC_COLS, SEC_IN, 2, n + 1)
    for row in ws.iter_rows(min_row=2, max_row=n + 1, min_col=6, max_col=6):
        for cell in row:
            if cell.hyperlink: cell.font = F(color="1F4E8C", underline="single")
    for name, ref in [("Decision", REF["A"]), ("Steps accurate?", REF["B"]), ("Job aid OK?", REF["B"]), ("Quiz OK?", REF["B"]), ("Priority", REF["C"]), ("PCB status", REF["D"])]:
        dropdown(ws, SEC_COLS, name, ref, 2, n + 1)
    dec = [c[0] for c in SEC_COLS].index("Decision") + 1; D_ = ws.cell(row=1, column=dec).column_letter
    for val, color in [("Keep", "E3F0E4"), ("Change", "FBEFD5"), ("Remove", "F6DADA"), ("Merge", "E4E8F4")]:
        ws.conditional_formatting.add(f"{D_}2:{D_}{n+1}", CellIsRule(operator="equal", formula=[f'"{val}"'], fill=PatternFill("solid", fgColor=color)))
    ws.conditional_formatting.add(f"D2:D{n+1}", CellIsRule(operator="equal", formula=['"Coming soon"'], font=F(italic=True, color="8A8478")))
    ws.auto_filter.ref = f"A1:{ws.cell(row=1, column=len(SEC_COLS)).column_letter}{n+1}"
    sec["dec_col"] = D_

def q(sec): return "'" + sec["sheet"].replace("'", "''") + "'"

# Sign-up: up to MAX_REVIEWERS reviewers per section
MAX_REVIEWERS = 5
REV = [(f"Reviewer {k}", 18) for k in range(1, MAX_REVIEWERS + 1)]
SU_COLS = ([("Section", 30), ("Course topics", 9), ("Live / coming soon", 13), ("Est. review time", 11)]
           + [x for k in range(1, MAX_REVIEWERS + 1) for x in ((f"Reviewer {k}", 18), (f"Reviewer {k} email", 24))]
           + [("Reviewers signed up", 10), ("Target date", 12), ("Audit status", 13), ("Audited so far", 11), ("Section verdict", 20), ("Section notes", 40), ("Go to section", 12)])
SU_IN = {n for n, _ in SU_COLS if n.startswith("Reviewer ") and n != "Reviewers signed up"} | {"Target date", "Audit status", "Section verdict", "Section notes"}
COL = {n: i + 1 for i, (n, _) in enumerate(SU_COLS)}
LET = lambda n: su.cell(row=1, column=COL[n]).column_letter
su = wb.create_sheet("Sign-up", 0); header(su, SU_COLS); su.freeze_panes = "B2"
name_lets = None
for i, sec in enumerate(SECTIONS, 2):
    live = sum(1 for r in sec["rows"] if r["slug"])
    mins = sum(int(re.match(r"\d+", r["time"]).group()) for r in sec["rows"] if r["slug"] and re.match(r"\d+", r["time"]))
    row = [""] * len(SU_COLS)
    row[COL["Section"] - 1] = f'{sec["no"]} {sec["name"]}'; row[COL["Course topics"] - 1] = sec["n"]
    row[COL["Live / coming soon"] - 1] = f'{live} / {sec["n"] - live}'; row[COL["Est. review time"] - 1] = f"about {round(mins * 1.5 / 5) * 5} min"
    row[COL["Audit status"] - 1] = "Not started"; row[COL["Go to section"] - 1] = "Open tab"
    row[COL["Audited so far"] - 1] = f'=IFERROR(COUNTA({q(sec)}!{sec["dec_col"]}2:{sec["dec_col"]}{sec["n"]+1})/{sec["n"]},0)'
    su.append(row)
    name_lets = [LET(f"Reviewer {k}") for k in range(1, MAX_REVIEWERS + 1)]
    su.cell(row=i, column=COL["Reviewers signed up"], value="=" + "+".join(f'(LEN({c}{i})>0)' for c in name_lets) + f'&" of {MAX_REVIEWERS}"')
    su.cell(row=i, column=COL["Go to section"]).hyperlink = f"#{q(sec)}!A1"
last = len(SECTIONS) + 1
style_rows(su, SU_COLS, SU_IN, 2, last)
for r in range(2, last + 1):
    su.cell(row=r, column=COL["Audited so far"]).number_format = "0%"; su.cell(row=r, column=COL["Target date"]).number_format = "mm/dd/yyyy"
    su.cell(row=r, column=COL["Go to section"]).font = F(color="1F4E8C", underline="single")
dropdown(su, SU_COLS, "Audit status", REF["E"], 2, last); dropdown(su, SU_COLS, "Section verdict", REF["F"], 2, last)
su.conditional_formatting.add(f'{LET("Audit status")}2:{LET("Audit status")}{last}', CellIsRule(operator="equal", formula=['"Done"'], fill=PatternFill("solid", fgColor="E3F0E4")))
for c in name_lets:   # highlight open reviewer slots
    su.conditional_formatting.add(f"{c}2:{c}{last}", FormulaRule(formula=[f"LEN({c}2)=0"], fill=PatternFill("solid", fgColor="FBEFD5")))
su.row_dimensions[1].height = 34

# Summary
SM_COLS = [("Section", 30), ("Reviewers", 26), ("Course topics", 9), ("Audited", 9), ("% done", 9), ("Keep", 8), ("Change", 8), ("Remove", 8), ("Merge", 8), ("High priority", 9), ("Audit status", 13)]
sm = wb.create_sheet("Summary"); header(sm, SM_COLS); sm.freeze_panes = "B2"
for i, sec in enumerate(SECTIONS, 2):
    d = f'{q(sec)}!{sec["dec_col"]}2:{sec["dec_col"]}{sec["n"]+1}'; pr = f'{q(sec)}!P2:P{sec["n"]+1}'
    sm.append([f'{sec["no"]} {sec["name"]}', "=MID(" + "&".join(f"IF(LEN('Sign-up'!{c}{i})>0,\", \"&'Sign-up'!{c}{i},\"\")" for c in name_lets) + ",3,500)", sec["n"], f"=COUNTA({d})",
               f"=IFERROR(D{i}/C{i},0)", f'=COUNTIF({d},"Keep")', f'=COUNTIF({d},"Change")', f'=COUNTIF({d},"Remove")', f'=COUNTIF({d},"Merge")',
               f'=COUNTIF({pr},"High")', f"='Sign-up'!{LET('Audit status')}{i}"])
t = len(SECTIONS) + 2
sm.append(["All sections", "", f"=SUM(C2:C{t-1})", f"=SUM(D2:D{t-1})", f"=IFERROR(D{t}/C{t},0)"] + [f"=SUM({c}2:{c}{t-1})" for c in "FGHIJ"] + [""])
style_rows(sm, SM_COLS, set(), 2, t)
for r in range(2, t + 1): sm.cell(row=r, column=5).number_format = "0%"
for c in range(1, len(SM_COLS) + 1): sm.cell(row=t, column=c).font = F(bold=True)

# Start here
H = wb.create_sheet("Start here", 0); H.column_dimensions["A"].width = 6; H.column_dimensions["B"].width = 110
H["B1"] = "HCM Academy section audit"; H["B1"].font = Font(name="Georgia", size=22, color=BLACK)
H["B2"] = "Sign up for a section, then audit every course topic in it. V.01 draft."; H["B2"].font = F(italic=True, color="5E5B55")
steps = [("1", "Sign up. On the Sign-up tab, put your name and email in the next open Reviewer slot (highlighted) for a section. Up to five reviewers per section; split the course topics between you and put your name in the Reviewer column of each row you audit."),
         ("2", "Set a target date and change Audit status to In progress."),
         ("3", "Open your section's tab (Go to section link). For each course topic, open the course (Link), then fill in the cream columns: your name, a Decision (Keep, Change, Remove, Merge), Merge with (if Merge), whether the steps, job aid, and quiz are accurate, and your notes."),
         ("4", "'Open items to confirm' lists what we already know needs a Vanderbilt check. Answer those in your notes when you can."),
         ("5", "When every row is done, pick a Section verdict on the Sign-up tab and set Audit status to Done."),
         ("", ""), ("", "Courses marked 'Oracle docs, pending SME review' were built from Oracle documentation and official sources. Check them closely against how Vanderbilt does the work."),
         ("", "Coming soon rows have no course yet. Use Notes to say what the course should cover or who the source should be."),
         ("", "Gray columns are filled in for you. PCB status and PCB response are for the PCB team."),
         ("", f"Site: {SITE}   ·   Playbook: {SITE}playbook/HCM_Playbook.pdf   ·   Questions: pcb@vanderbilt.edu")]
for i, (k, v) in enumerate(steps, 4):
    H[f"A{i}"] = k; H[f"B{i}"] = v; H[f"A{i}"].font = Font(name="Arial", bold=True, size=14, color=OAK); H[f"B{i}"].font = F(); H[f"B{i}"].alignment = WRAP
    H.row_dimensions[i].height = 30 if v else 10

L.sheet_state = "hidden"; wb.move_sheet("Lists", offset=len(wb.sheetnames))
for ws in wb.worksheets:
    ws.sheet_properties.tabColor = BLACK if ws.title in ("Start here", "Sign-up", "Summary") else GOLD
    ws.page_setup.orientation = "landscape"; ws.page_setup.fitToWidth = 1; ws.page_setup.fitToHeight = 0; ws.sheet_properties.pageSetUpPr.fitToPage = True
wb.active = wb.sheetnames.index("Sign-up")
out = os.path.join(ROOT, "docs", "HCM_Academy_Section_Audit.xlsx"); wb.save(out)
print(f"wrote {out}: {len(SECTIONS)} sections, {sum(s['n'] for s in SECTIONS)} course topics")
