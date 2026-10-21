#!/usr/bin/env python3
"""Build the topic audit PDF source: docs/audit/index.html (every topic, subsection, and course topic,
with status, source, and Keep / Change / Remove boxes). Render with: node tools/render_topic_audit.cjs"""
import html, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from course_content import COURSES  # noqa: E402
ROOT = os.path.dirname(HERE)
E = lambda s: html.escape(str(s), quote=True)
BY = {c["slug"]: c for c in COURSES}
landing = open(os.path.join(ROOT, "index.html"), encoding="utf-8").read()

def source(slug):
    if not slug: return ("none", "No content yet")
    return ("oracle", "Oracle docs, pending SME review") if BY[slug].get("pending", "").startswith("Built from Oracle") else ("vu", "Vanderbilt SME sources")

topics, counts = [], {"vu": 0, "oracle": 0, "none": 0}
for m in re.finditer(r'<section class="card[^"]*" id="([a-z]+)" data-short="([^"]*)">(.*?)</section>', landing, re.S):
    cid, short, body = m.groups()
    t = dict(no=re.search(r'<span class="no"[^>]*>(\d+)</span>', body).group(1), name=html.unescape(re.search(r"<h3>(.*?)</h3>", body).group(1)),
             blurb=html.unescape(re.search(r"</h3>\s*<p>(.*?)</p>", body, re.S).group(1)), subs=[])
    sub = None
    for part in re.split(r'(<h4 class="subhead">.*?</h4>)', body):
        h = re.match(r'<h4 class="subhead">(.*?)</h4>', part)
        if h: sub = dict(name=html.unescape(h.group(1)), rows=[]); t["subs"].append(sub); continue
        for li in re.finditer(r'<li([^>]*)>(.*?)</li>', part, re.S):
            attrs, inner = li.groups()
            if "data-assess" in attrs: continue
            if 'class="group"' in attrs:
                if sub is None: sub = dict(name="", rows=[]); t["subs"].append(sub)
                sub["rows"].append(dict(group=html.unescape(re.sub("<[^>]+>", "", inner)))); continue
            tt = re.search(r'class="tt">(.*?)</span>', inner); ds = re.search(r'class="ds">(.*?)</span>', inner); tm = re.search(r'Time: </span>([^<]*)', inner)
            if not tt: continue
            if sub is None: sub = dict(name="", rows=[]); t["subs"].append(sub)
            slug = (re.search(r'data-course="([^"]+)"', attrs) or [None, None])[1]
            see = re.search(r'data-see="([^"]+)"', attrs)
            r = dict(title=html.unescape(tt.group(1)), desc=html.unescape(ds.group(1)) if ds else "", time=tm.group(1) if tm else "",
                     sub_item='class="sub"' in attrs, see=bool(see), slug=slug)
            if not see:
                k, label = source(slug); r["src"], r["label"] = k, label; counts[k] += 1
            sub["rows"].append(r)
    topics.append(t)
total = sum(counts.values())

def rows_html(rows, n0):
    out, n = [], n0
    for r in rows:
        if "group" in r:
            out.append(f'<tr class="grp"><td></td><td colspan="5">{E(r["group"])}</td></tr>'); continue
        if r["see"]:
            out.append(f'<tr class="see"><td></td><td class="ti{" in" if r["sub_item"] else ""}"><b>{E(r["title"])}</b><span>Listed here for reference; audited in 06 Students &amp; Faculty.</span></td><td colspan="4"></td></tr>'); continue
        n += 1
        status = "Live" if r["slug"] else "Coming soon"
        out.append(f'<tr><td class="no">{n}</td><td class="ti{" in" if r["sub_item"] else ""}"><b>{E(r["title"])}</b><span>{E(r["desc"])}</span></td>'
                   f'<td><span class="st {"live" if r["slug"] else "soon"}">{status}</span></td><td><span class="src {r["src"]}">{E(r["label"])}</span></td>'
                   f'<td class="tm">{E(r["time"])}</td><td class="aud"><span class="bx"></span>Keep <span class="bx"></span>Change <span class="bx"></span>Remove<div class="note"></div></td></tr>')
    return "\n".join(out), n

body, n = [], 0
for t in topics:
    live = sum(1 for s in t["subs"] for r in s["rows"] if r.get("slug")); allr = sum(1 for s in t["subs"] for r in s["rows"] if "title" in r and not r["see"])
    secs = []
    for s in t["subs"]:
        h, n = rows_html(s["rows"], n)
        secs.append((f'<h3>{E(s["name"])}</h3>' if s["name"] else "") +
                    '<table><thead><tr><th>#</th><th>Course topic</th><th>Status</th><th>Source</th><th>Time</th><th>Audit</th></tr></thead><tbody>' + h + '</tbody></table>')
    body.append(f'<section class="topic"><div class="thead"><span class="tno">{E(t["no"])}</span><div><h2>{E(t["name"])}</h2><p>{E(t["blurb"])} <b>{live} of {allr} live.</b></p></div></div>'
                f'<div class="tq">Topic level: <span class="bx"></span>Right topic <span class="bx"></span>Rename <span class="bx"></span>Reorder <span class="bx"></span>Missing subtopics<div class="note"></div></div>'
                + "".join(secs) + '</section>')

summary = "".join(f'<li><b>{E(t["no"])}</b><span>{E(t["name"])}</span><i>{sum(1 for s in t["subs"] for r in s["rows"] if r.get("slug"))} / {sum(1 for s in t["subs"] for r in s["rows"] if "title" in r and not r["see"])}</i></li>' for t in topics)
doc = f'''<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8" /><title>HCM Academy Topic Audit</title>
<link rel="stylesheet" href="audit.css" /></head>
<body>
<section class="cover">
  <img src="../../assets/img/vu-lockup-black.png" alt="Vanderbilt University" class="lockup" />
  <p class="eyebrow">HCM Academy &middot; V.01 draft &middot; October 2026</p>
  <h1>Topic <em>audit</em>.</h1>
  <p class="lede">Every topic, subtopic, and course topic in HCM Academy. For each one, check Keep, Change, or Remove and add a note. Use the topic-level boxes to flag a topic that should be renamed, reordered, or is missing subtopics.</p>
  <div class="stats"><div><b>{total}</b><span>course topics</span></div><div><b>{counts["vu"]}</b><span>live from Vanderbilt SME sources</span></div><div><b>{counts["oracle"]}</b><span>live from Oracle docs, pending SME review</span></div><div><b>{counts["none"]}</b><span>coming soon, no content yet</span></div></div>
  <ol class="sum">{summary}</ol>
  <div class="legend"><span class="src vu">Vanderbilt SME sources</span> Built from SME sessions, training transcripts, Vanderbilt guides, or the Guidde walkthrough.
    <span class="src oracle">Oracle docs, pending SME review</span> Built from Oracle documentation and official sources; confirm it matches Vanderbilt practice.
    <span class="src none">No content yet</span> Listed on the site as Coming soon.</div>
  <div class="sign"><div>Reviewer</div><div>Area or role</div><div>Date</div></div>
  <p class="ret">Return to pcb@vanderbilt.edu. Online: me5231979.github.io/HCM_Academy</p>
</section>
{chr(10).join(body)}
</body></html>'''
os.makedirs(os.path.join(ROOT, "docs", "audit"), exist_ok=True)
open(os.path.join(ROOT, "docs", "audit", "index.html"), "w", encoding="utf-8").write(doc)
print(f"audit: {len(topics)} topics, {total} course topics ({counts})")
