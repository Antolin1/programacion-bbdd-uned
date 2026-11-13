#!/usr/bin/env python3
"""Genera mision-sql-presentacion.pptx a partir de web/presentacion/slides.md, con objetos editables
(cuadros de texto, formas y tablas) para importarlo en Genially.

Reproduce el diseño de la presentación Reveal.js: lienzo de 1280x720 px (10 x 5,625 pulgadas),
mismos tamaños de letra (px * 0,5625 = pt), misma paleta y los fondos de web/presentacion/fondos/.
Requisitos: pip install python-pptx pillow. Uso: python3 genially/generar_pptx.py
"""
import html, os, re, sqlite3
from PIL import ImageFont
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR, MSO_AUTO_SIZE
from pptx.oxml.ns import qn
from lxml import etree

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
FONTS = os.path.join(HERE, "fuentes")  # Nunito y Roboto Mono (licencia OFL), solo para medir el texto
OUT = os.path.join(HERE, "mision-sql-presentacion.pptx")
BASE_URL = "https://antolin1.github.io/programacion-bbdd-uned/presentacion/"

FONT, MONO = "Nunito", "Roboto Mono"
PX = 1 / 128  # pulgadas por píxel (1280 px = 10 in)
PT = 0.5625   # puntos por píxel
SLIDE_W, SLIDE_H = 1280, 720
LIMIT_Y = 596  # donde empieza el paisaje

C = dict(text="3A2A17", muted="7A6850", lemon="F4C430", lemonink="946800", orange="D9691C",
         green="3F8A32", red="C4432C", blue="2A7AA3", violet="7B3F73", leaf="2F5D24", earth="8A5A2B",
         panel="FFFDF7", border="E2D6C5", bg="F6EEDB", codebg="F3EDE3", nota="F6E6B9", aviso="F1DDCA",
         rutaj="F3E1C8", white="FFFFFF", dark="1C1C1C", visor="836725", tint="EDE4D4")

# ------------------------------------------------------------------ medición de texto
_fontcache = {}
def _pil(kind, px):
    key = (kind, px)
    if key not in _fontcache:
        if kind == "mono":
            f = ImageFont.truetype(os.path.join(FONTS, "RobotoMono.ttf"), px); f.set_variation_by_name("Regular")
        elif kind == "monob":
            f = ImageFont.truetype(os.path.join(FONTS, "RobotoMono.ttf"), px); f.set_variation_by_name("Bold")
        elif kind == "i":
            f = ImageFont.truetype(os.path.join(FONTS, "NunitoItalic.ttf"), px); f.set_variation_by_name("Italic")
        elif kind == "bi":
            f = ImageFont.truetype(os.path.join(FONTS, "NunitoItalic.ttf"), px); f.set_variation_by_name("Bold Italic")
        elif kind == "b":
            f = ImageFont.truetype(os.path.join(FONTS, "Nunito.ttf"), px); f.set_variation_by_name("Bold")
        else:
            f = ImageFont.truetype(os.path.join(FONTS, "Nunito.ttf"), px); f.set_variation_by_name("Regular")
        _fontcache[key] = f
    return _fontcache[key]

def text_w(s, pt, bold=False, italic=False, mono=False):
    """Anchura en pulgadas de una cadena a `pt` puntos."""
    kind = "mono" if mono and not bold else "monob" if mono else ("bi" if bold and italic else "b" if bold else "i" if italic else "r")
    f = _pil(kind, 100)
    return f.getlength(s) / 100 * pt / 72 * 1.02

LH = 1.40  # altura de línea (em) para estimar alturas; Nunito mide 1,364 em en PowerPoint

# ------------------------------------------------------------------ parser de slides.md
def parse_attrs(tag):
    a = dict(re.findall(r'([\w-]+)="([^"]*)"', tag))
    cls = set(a.get("class", "").split())
    style = {}
    for k, v in re.findall(r'([\w-]+):\s*([^;]+)', a.get("style", "")):
        style[k] = v.strip()
    return a, cls, style

def parse_inline(s):
    """Convierte Markdown + HTML en línea en una lista de runs/objetos."""
    s = s.replace("\n", " ")
    runs, stack = [], []
    def st():
        d = dict(b=False, i=False, code=False, u=False, link=None)
        for k, v in stack:
            if k == "link": d["link"] = v
            else: d[k] = True
        return d
    def emit(text):
        if text == "": return
        text = html.unescape(text)
        runs.append(dict(st(), text=text))
    def toggle(k, v=True):
        for j in range(len(stack) - 1, -1, -1):
            if stack[j][0] == k: del stack[j]; return
        stack.append((k, v))
    i = 0
    pat = re.compile(r'(\*\*|\*|`|<[^>]+>|\[([^\]]+)\]\(([^)]+)\))')
    while i < len(s):
        m = pat.search(s, i)
        if not m: emit(s[i:]); break
        emit(s[i:m.start()]); i = m.end()
        tok = m.group(1)
        if tok == "**": toggle("b")
        elif tok == "*": toggle("i")
        elif tok == "`":
            j = s.find("`", i); emit_code = s[i:j]; i = j + 1
            runs.append(dict(st(), text=html.unescape(emit_code), code=True))
        elif tok.startswith("["):
            runs.append(dict(st(), text=m.group(2), link=m.group(3)))
        else:  # etiqueta HTML
            name = re.match(r'</?\s*([\w-]+)', tok).group(1).lower(); closing = tok.startswith("</")
            a, cls, style = parse_attrs(tok)
            if name in ("b", "strong"): toggle("b")
            elif name in ("em", "i"): toggle("i")
            elif name == "u": toggle("u")
            elif name == "code":
                if closing:
                    toggle("code")
                else:
                    j = s.find("</code>", i); runs.append(dict(st(), text=html.unescape(s[i:j]), code=True)); i = j + len("</code>")
            elif name == "br": runs.append({"obj": "br"})
            elif name == "a":
                if closing: toggle("link")
                elif "btn" in cls:
                    j = s.find("</a>", i); runs.append({"obj": "btn", "cls": cls, "text": html.unescape(s[i:j]).strip(), "href": a.get("href")}); i = j + 4
                else: toggle("link", a.get("href"))
            elif name == "span":
                if closing: continue
                j = s.find("</span>", i); inner = html.unescape(s[i:j]).strip(); i = j + len("</span>")
                if "pill" in cls: runs.append({"obj": "pill", "cls": cls, "text": inner})
                elif "llave" in cls: runs.append({"obj": "llave", "digit": a.get("data-digit")})
                elif "n" in cls: runs.append(dict(st(), text=inner, color="leaf"))
                elif "sol-out" in cls: pass
                else: runs.append(dict(st(), text=inner))
            elif name == "button":
                if closing: continue
                j = s.find("</button>", i); runs.append({"obj": "btn", "cls": cls, "text": html.unescape(s[i:j]).strip(), "sol": a.get("data-sol")}); i = j + len("</button>")
            elif name == "input":
                runs.append({"obj": "input", "placeholder": a.get("placeholder", ""), "type": a.get("type")})
            elif name in ("label", "form", "p", "div"): pass
    return runs

def parse_table(lines):
    rows = []
    for ln in lines:
        if re.match(r'^\|[\s:|-]+\|$', ln): continue
        cells = [c.strip() for c in ln.strip().strip("|").split("|")]
        rows.append([parse_inline(c) for c in cells])
    return {"t": "table", "rows": rows}

def parse_slide(src):
    classes, notes = set(), ""
    m = re.search(r'<!--\s*\.slide:\s*class="([^"]+)"\s*-->', src)
    if m: classes = set(m.group(1).split()); src = src.replace(m.group(0), "")
    if "\nNote:" in src: src, notes = src.split("\nNote:", 1); notes = notes.strip()
    lines = src.split("\n")
    root = {"t": "div", "cls": set(), "children": [], "style": {}, "id": None}
    stack = [root]
    def add(node): stack[-1]["children"].append(node)
    i = 0
    while i < len(lines):
        ln = lines[i]; s = ln.strip()
        if s == "": i += 1; continue
        if s.startswith("```"):
            j = i + 1; buf = []
            while not lines[j].startswith("```"): buf.append(lines[j]); j += 1
            run, after = False, None
            if buf and buf[0].startswith("--run"):
                mm = re.match(r'--run(?:\s+after:\s*(.+))?\s*$', buf[0]); run, after = True, mm.group(1); buf = buf[1:]
            add({"t": "code", "text": "\n".join(buf).rstrip(), "run": run, "after": after}); i = j + 1; continue
        if s.startswith("|"):
            j = i; buf = []
            while j < len(lines) and lines[j].strip().startswith("|"): buf.append(lines[j].strip()); j += 1
            add(parse_table(buf)); i = j; continue
        mh = re.match(r'^(#{1,3})\s+(.*)$', s)
        if mh: add({"t": "h", "level": len(mh.group(1)), "inl": parse_inline(mh.group(2))}); i += 1; continue
        if re.match(r'^(-|\d+\.)\s', s):
            ordered = s[0].isdigit(); items = []; j = i; start = int(re.match(r'\d+', s).group(0)) if ordered else 1
            while j < len(lines) and re.match(r'^(-|\d+\.)\s', lines[j].strip()):
                items.append(parse_inline(re.sub(r'^(-|\d+\.)\s+', '', lines[j].strip()))); j += 1
            add({"t": "ol" if ordered else "ul", "items": items, "start": start}); i = j; continue
        if s.startswith("<div"):
            a, cls, style = parse_attrs(s)
            if s.endswith("</div>") and s.count("<div") == s.count("</div>"):
                # div de una sola línea: visor, teclado, barra, hijos de ruta/pasos, placeholders
                inner = re.sub(r'^<div[^>]*>', '', s)[:-len("</div>")]
                if "visor" in cls: add({"t": "visor"})
                elif "teclado" in cls: add({"t": "teclado"})
                elif "barra" in cls: add({"t": "barra"})
                elif a.get("id") in ("resumen-equipo", "insignias"): add({"t": "placeholder", "id": a["id"]})
                else: add({"t": "divline", "cls": cls, "inl": parse_inline(inner)})
                i += 1; continue
            node = {"t": "div", "cls": cls, "id": a.get("id"), "style": style, "children": []}
            add(node); stack.append(node); i += 1; continue
        if s == "</div>": stack.pop(); i += 1; continue
        if s.startswith("<svg"):
            variant = "inner" if 'clip-path="url(' in s else ("left" if 'cx="86" cy="66" r="54" fill="#3f8a32"' in s else "right")
            add({"t": "svg", "variant": variant}); i += 1; continue
        if s.startswith("<form"):
            j = i; buf = []
            while "</form>" not in lines[j]: buf.append(lines[j]); j += 1
            buf.append(lines[j]); add({"t": "form", "inl": parse_inline(" ".join(buf))}); i = j + 1; continue
        if s.startswith("<label"):
            add({"t": "label", "inl": parse_inline(re.sub(r'</?label>', '', s))}); i += 1; continue
        if s.startswith("<p"):
            j = i; buf = []
            while "</p>" not in lines[j]: buf.append(lines[j]); j += 1
            buf.append(lines[j]); full = " ".join(buf)
            a, cls, style = parse_attrs(full[:full.index(">") + 1])
            inner = re.sub(r'^<p[^>]*>', '', full).rsplit("</p>", 1)[0]
            add({"t": "p", "cls": cls, "id": a.get("id"), "style": style, "inl": parse_inline(inner)}); i = j + 1; continue
        # párrafo de texto corrido (Markdown o HTML en línea)
        j = i; buf = []
        while j < len(lines) and lines[j].strip() != "" and not re.match(r'^(```|\||#|<div|</div|<p|<svg|<form|<label|-\s|\d+\.\s)', lines[j].strip()):
            buf.append(lines[j].strip()); j += 1
        add({"t": "p", "cls": set(), "id": None, "style": {}, "inl": parse_inline(" ".join(buf))}); i = j
    return classes, root, notes

# ------------------------------------------------------------------ resultados de las consultas
SCHEMA = open(os.path.join(ROOT, "web/data/cooperativa.sql"), encoding="utf-8").read()
def run_sql(code, after):
    con = sqlite3.connect(":memory:"); con.isolation_level = None
    con.executescript("PRAGMA foreign_keys=ON;" + SCHEMA)
    sql = re.sub(r'\bSTART\s+TRANSACTION\b', 'BEGIN', code, flags=re.I)
    res = {}
    try:
        stmts = [x for x in sql.split(";") if x.strip() and not re.fullmatch(r'(\s*--[^\n]*\n?)+', x + "\n")]
        last = None; modified = 0
        for st in stmts:
            cur = con.execute(st)
            if cur.description: last = ([d[0] for d in cur.description], cur.fetchall())
            elif cur.rowcount > 0: modified = cur.rowcount
        if last and not after: res["cols"], res["rows"] = last
        else: res["modified"] = modified
        if after:
            cur = con.execute(after); res["acols"], res["arows"] = [d[0] for d in cur.description], cur.fetchall()
    except Exception as e:
        res["error"] = str(e)
    return res

def fmt(v):
    if isinstance(v, float):
        s = f"{v:.10g}"
        return s
    return "" if v is None else str(v)

# ------------------------------------------------------------------ primitivas pptx
def rgb(k): return RGBColor.from_string(C.get(k, k))

def set_run(run, text, pt, color="text", bold=False, italic=False, mono=False, underline=False, link=None):
    run.text = text
    f = run.font; f.size = Pt(pt); f.name = MONO if mono else FONT; f.bold = bold; f.italic = italic
    f.color.rgb = rgb(color)
    if underline: f.underline = True
    if link: f.color.rgb = rgb("blue"); f.underline = True

def para_bullet(p, kind, color="orange", num=None, indent_in=0.30, size_pt=None):
    pPr = p._p.get_or_add_pPr()
    pPr.set("marL", str(int(Inches(indent_in)))); pPr.set("indent", str(-int(Inches(indent_in))))
    for tag in ("a:buClr", "a:buSzPct", "a:buFont", "a:buChar", "a:buAutoNum", "a:buNone"):
        for e in pPr.findall(qn(tag)): pPr.remove(e)
    clr = etree.SubElement(pPr, qn("a:buClr")); s = etree.SubElement(clr, qn("a:srgbClr")); s.set("val", C[color])
    if kind == "ul":
        bf = etree.SubElement(pPr, qn("a:buFont")); bf.set("typeface", "Arial")
        bc = etree.SubElement(pPr, qn("a:buChar")); bc.set("char", "•")
    else:
        an = etree.SubElement(pPr, qn("a:buAutoNum")); an.set("type", "arabicPeriod")
        if num: an.set("startAt", str(num))

class Ctx:
    def __init__(self, slide, draw=True):
        self.slide = slide; self.draw = draw
    def copy(self):
        c = Ctx.__new__(Ctx); c.__dict__.update(self.__dict__); return c

def add_textbox(ctx, x, y, w, h, paras, align="l", anchor="t", wrap=True, autofit=False):
    """paras: lista de párrafos; cada párrafo = dict(runs=[(text, opts)], space_after_pt, line_spacing, bullet)"""
    if not ctx.draw: return None
    tb = ctx.slide.shapes.add_textbox(Inches(x * PX), Inches(y * PX), Inches(w * PX), Inches(h * PX))
    tf = tb.text_frame; tf.word_wrap = wrap; tf.auto_size = MSO_AUTO_SIZE.NONE
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    tf.vertical_anchor = {"t": MSO_ANCHOR.TOP, "m": MSO_ANCHOR.MIDDLE, "b": MSO_ANCHOR.BOTTOM}[anchor]
    first = True
    for pd in paras:
        p = tf.paragraphs[0] if first else tf.add_paragraph(); first = False
        p.alignment = {"l": PP_ALIGN.LEFT, "c": PP_ALIGN.CENTER, "r": PP_ALIGN.RIGHT}[pd.get("align", align)]
        if pd.get("space_after") is not None: p.space_after = Pt(pd["space_after"])
        if pd.get("space_before") is not None: p.space_before = Pt(pd["space_before"])
        p.line_spacing = pd.get("line_spacing", 1.0)
        if pd.get("bullet"): para_bullet(p, pd["bullet"], num=pd.get("num"), indent_in=pd.get("indent", 0.30))
        for text, o in pd["runs"]:
            if text == "\n": p.add_line_break(); continue
            set_run(p.add_run(), text, **o)
    return tb

def add_rect(ctx, x, y, w, h, fill=None, line=None, line_w=1.5, radius_px=None, dash=False, shadow=False, text=None, text_opts=None, shape=None):
    if not ctx.draw: return None
    kind = shape or (MSO_SHAPE.ROUNDED_RECTANGLE if radius_px else MSO_SHAPE.RECTANGLE)
    sh = ctx.slide.shapes.add_shape(kind, Inches(x * PX), Inches(y * PX), Inches(w * PX), Inches(h * PX))
    if radius_px and kind == MSO_SHAPE.ROUNDED_RECTANGLE:
        sh.adjustments[0] = min(0.5, radius_px / min(w, h))
    if fill: sh.fill.solid(); sh.fill.fore_color.rgb = rgb(fill)
    else: sh.fill.background()
    if line: sh.line.color.rgb = rgb(line); sh.line.width = Pt(line_w)
    else: sh.line.fill.background()
    if dash:
        from pptx.enum.dml import MSO_LINE
        sh.line.dash_style = MSO_LINE.DASH
    if not shadow:
        sp = sh._element.spPr; ef = etree.SubElement(sp, qn("a:effectLst"))
    tf = sh.text_frame; tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    tf.word_wrap = True; tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    if text is not None:
        p = tf.paragraphs[0]; p.alignment = PP_ALIGN.CENTER
        set_run(p.add_run(), text, **text_opts)
    return sh

# ------------------------------------------------------------------ runs -> párrafos pptx y medidas
def run_opts(r, size_pt, base_color="text", bold_color="leaf", code_scale=0.78, in_code=False):
    o = dict(pt=size_pt, color=base_color, bold=False, italic=False, mono=False, underline=False, link=None)
    if r.get("b"): o["bold"] = True; o["color"] = bold_color
    if r.get("i"): o["italic"] = True; o["color"] = "earth" if base_color == "text" else base_color
    if r.get("code"): o["mono"] = True; o["pt"] = round(size_pt * code_scale, 1); o["color"] = "earth" if base_color == "text" else base_color
    if r.get("u"): o["underline"] = True
    if r.get("color"): o["color"] = r["color"]
    if r.get("link"): o["link"] = abs_url(r["link"])
    return o

def abs_url(href):
    if not href or href.startswith("#"): return None
    if href.startswith("http"): return href
    from urllib.parse import urljoin
    return urljoin(BASE_URL, href)

def wrap_lines(runs, size_pt, w_px, opts_fn):
    """Divide los runs de texto en líneas que caben en w_px. Devuelve lista de líneas (lista de (texto, opts))."""
    w_in = w_px * PX
    lines, cur, cur_w = [], [], 0.0
    def push(): nonlocal cur, cur_w; lines.append(cur); cur, cur_w = [], 0.0
    for r in runs:
        if r.get("obj") == "br": push(); continue
        if "obj" in r: continue
        o = opts_fn(r)
        words = re.split(r'(\s+)', r["text"])
        for wd in words:
            if wd == "": continue
            ww = text_w(wd, o["pt"], o["bold"], o["italic"], o["mono"])
            if cur_w + ww > w_in + 1e-6 and cur and not wd.isspace():
                push()
            if wd.isspace() and not cur: continue
            cur.append((wd, o)); cur_w += ww
    if cur or not lines: push()
    return lines

def para_height_px(runs, size_pt, w_px, opts_fn, lh=LH):
    n = len(wrap_lines(runs, size_pt, w_px, opts_fn))
    return n * size_pt * lh / 72 / PX

def runs_to_pptx(runs, opts_fn):
    out = []
    for r in runs:
        if r.get("obj") == "br": out.append(("\n", {})); continue
        if "obj" in r: continue
        o = opts_fn(r)
        if o.get("link"):
            for w in re.split(r'(\s+)', r["text"]):
                if w: out.append((w, dict(o)))
        else:
            out.append((r["text"], o))
    return out

# ------------------------------------------------------------------ bloques
class Flow:
    """Coloca bloques en vertical dentro de una columna."""
    def __init__(self, ctx, x, y, w, size_px=30, color="text", align="l", bloque=False, in_cols=False):
        self.ctx, self.x, self.y, self.w = ctx, x, y, w
        self.size_px, self.color, self.align, self.bloque, self.in_cols = size_px, color, align, bloque, in_cols
        self.last_mb = 0
        self.top = y; self.first = True
    def gap(self, mt):
        if self.first: self.first = False; return
        self.y += max(self.last_mb, mt)
    def done(self, mb): self.last_mb = mb
    def height(self): return self.y - self.top

def block(fl, node):
    t = node["t"]
    fn = {"h": blk_heading, "p": blk_para, "ul": blk_list, "ol": blk_list, "code": blk_code, "table": blk_table,
          "div": blk_div, "divline": blk_divline, "svg": blk_svg, "form": blk_form, "label": blk_label,
          "visor": blk_visor, "teclado": blk_teclado, "barra": blk_barra, "placeholder": blk_placeholder}[t]
    fn(fl, node)

def blk_heading(fl, node):
    lvl = node["level"]
    if lvl == 1: px, color, bold, mb, mt = 50, ("white" if fl.bloque else "leaf"), True, 0.35, 0
    elif lvl == 2: px, color, bold, mb, mt = 34, ("lemon" if fl.bloque else "orange"), True, 0.3, 0
    else: px, color, bold, mb, mt = 28, "leaf", True, 0.2, 0
    pt = px * PT
    fl.gap(mt * px)
    def of(r):
        o = run_opts(r, pt, base_color=color, bold_color=color); o["bold"] = bold
        if r.get("color") == "leaf": o["color"] = "leaf"
        return o
    h = para_height_px(node["inl"], pt, fl.w, of, lh=1.25 if lvl == 1 else 1.3)
    add_textbox(fl.ctx, fl.x, fl.y, fl.w, h, [dict(runs=runs_to_pptx(node["inl"], of), line_spacing=0.9 if lvl == 1 else 0.95)], align=fl.align)
    fl.y += h; fl.done(mb * px)

def para_size(fl, cls):
    px = fl.size_px
    if "s" in cls: px = 25
    if "t" in cls: px = 21
    if "kicker" in cls: px = 27
    if "meta" in cls: px = 28
    return px

def has_objs(runs): return any(r.get("obj") in ("pill", "btn", "llave", "input") for r in runs)

def blk_para(fl, node):
    cls = node.get("cls", set()); px = para_size(fl, cls); pt = px * PT
    if not node["inl"]: return
    color = "muted" if "muted" in cls else fl.color
    align = "c" if ("centro" in cls or fl.align == "c") else fl.align
    mt = float(node.get("style", {}).get("margin-top", "0").replace("px", "")) if node.get("style") else 0
    fl.gap(mt)
    if "necesitas" in cls:
        blk_necesitas(fl, node); return
    bold_color = "lemon" if fl.bloque else "leaf"
    of = lambda r: run_opts(r, pt, base_color=color, bold_color=bold_color)
    if has_objs(node["inl"]):
        h = inline_flow(fl, node["inl"], pt, of, align)
    else:
        h = para_height_px(node["inl"], pt, fl.w, of)
        add_textbox(fl.ctx, fl.x, fl.y, fl.w, h, [dict(runs=runs_to_pptx(node["inl"], of))], align=align)
    fl.y += h; fl.done(0.6 * px)

def blk_necesitas(fl, node):
    px = 19; pt = px * PT
    of = lambda r: run_opts(r, pt, bold_color="orange")
    pad_x, pad_y = 16, 10
    h = para_height_px(node["inl"], pt, fl.w - 2 * pad_x, of, lh=1.35) + 2 * pad_y
    add_rect(fl.ctx, fl.x, fl.y, fl.w, h, fill="panel", line="border", radius_px=14)
    add_textbox(fl.ctx, fl.x + pad_x, fl.y + pad_y, fl.w - 2 * pad_x, h - 2 * pad_y, [dict(runs=runs_to_pptx(node["inl"], of))], align="l")
    fl.y += h; fl.done(0)

def pill_size(text, pt):
    return text_w(text, pt, bold=True) / PX + 22, pt * 1.5 / 72 / PX

def draw_pill(ctx, x, y, text, cls, pt):
    w, h = pill_size(text, pt)
    fill, color = "lemon", "text"
    if "v" in cls: fill, color = "green", "white"
    if "a" in cls: fill, color = "blue", "white"
    if "n" in cls: fill, color = "orange", "white"
    if "b" in cls: fill, color = "violet", "white"
    add_rect(ctx, x, y, w, h, fill=fill, radius_px=h, text=text, text_opts=dict(pt=pt, color=color, bold=True))
    return w, h

def btn_geom(text, cls):
    if "big" in cls: px, padx, pady, radius = 34, 38, 12, 999
    elif "small" in cls: px, padx, pady, radius = 22, 14, 8, 11
    else: px, padx, pady, radius = 22, 20, 12, 14
    pt = px * PT
    w = text_w(text, pt, bold=True) / PX + 2 * padx
    h = pt * 1.25 / 72 / PX + 2 * pady
    return pt, w, h, radius

def draw_btn(ctx, x, y, text, cls, href=None):
    pt, w, h, radius = btn_geom(text, cls)
    if "ghost" in cls: fill, color, line = "panel", "text", "border"
    elif "lemon" in cls: fill, color, line = "lemon", "text", None
    else: fill, color, line = "orange", "white", None
    sh = add_rect(ctx, x, y, w, h, fill=fill, line=line, line_w=1, radius_px=radius, text=text, text_opts=dict(pt=pt, color=color, bold=True))
    if sh is not None and href: sh.click_action.hyperlink.address = href
    return w, h

def draw_llave(ctx, x, y):
    w, h = 92, 104
    add_rect(ctx, x, y, w, h, fill="panel", line="orange", line_w=3, radius_px=18, dash=True, text="?", text_opts=dict(pt=50 * PT, color="muted", bold=True))
    return w, h

class It:
    def __init__(self, kind, w, h, data=None, space=False):
        self.kind, self.w, self.h, self.data, self.space = kind, w, h, data, space

def inline_flow(fl, runs, pt, of, align):
    """Línea(s) con texto y objetos (píldoras, botones, llaves, campos). Devuelve la altura."""
    gap = 8; text_h = pt * LH / 72 / PX
    items = []
    for r in runs:
        o = r.get("obj")
        if o == "pill":
            w, h = pill_size(r["text"], pt * 0.74); items.append(It("pill", w, h, r))
        elif o == "btn":
            _, w, h, _ = btn_geom(r["text"], r["cls"]); items.append(It("btn", w, h, r))
        elif o == "llave": items.append(It("llave", 92, 104, r))
        elif o == "input": items.append(It("input", 200, 22 * PT * 1.3 / 72 / PX + 16, r))
        elif o == "br": items.append(It("br", 0, 0))
        else:
            opts = of(r)
            for wd in re.split(r'(\s+)', r["text"]):
                if wd == "": continue
                items.append(It("w", text_w(wd, opts["pt"], opts["bold"], opts["italic"], opts["mono"]) / PX, text_h, (wd, opts), wd.isspace()))
    clean = []
    for it in items:
        if it.kind == "w" and it.space and clean and clean[-1].kind not in ("w", "br"): continue
        if it.kind not in ("w", "br") and clean and clean[-1].kind == "w" and clean[-1].space: clean.pop()
        clean.append(it)
    items = clean
    lines, cur, cw = [], [], 0
    for it in items:
        if it.kind == "br": lines.append(cur); cur, cw = [], 0; continue
        if it.kind == "w" and it.space and not cur: continue
        extra = gap if cur and (it.kind != "w" or cur[-1].kind != "w") else 0
        if cur and cw + extra + it.w > fl.w and not (it.kind == "w" and it.space):
            lines.append(cur); cur, cw = [], 0; extra = 0
        cur.append(it); cw += extra + it.w
    if cur: lines.append(cur)
    y = fl.y
    for ln in lines:
        while ln and ln[-1].kind == "w" and ln[-1].space: ln.pop()
        if not ln: y += text_h + 6; continue
        lh = max(it.h for it in ln)
        segs, k = [], 0
        while k < len(ln):
            if ln[k].kind == "w":
                grp = []
                while k < len(ln) and ln[k].kind == "w": grp.append(ln[k]); k += 1
                segs.append(["text", sum(g.w for g in grp), text_h, grp])
            else:
                segs.append([ln[k].kind, ln[k].w, ln[k].h, ln[k].data]); k += 1
        has_input = any(s[0] == "input" for s in segs)
        used = sum(s[1] for s in segs) + gap * (len(segs) - 1)
        if has_input:
            for s in segs:
                if s[0] == "input": s[1] = fl.w - (used - s[1])
            used = fl.w
        x = fl.x + ((fl.w - used) / 2 if align == "c" else 0)
        for kind, w, h, data in segs:
            yy = y + (lh - h) / 2
            if kind == "text":
                add_textbox(fl.ctx, x, yy, w + 6, h, [dict(runs=[g.data for g in data])], wrap=False)
            elif kind == "pill": draw_pill(fl.ctx, x, yy, data["text"], data["cls"], pt * 0.74)
            elif kind == "btn": draw_btn(fl.ctx, x, yy, data["text"], data["cls"], abs_url(data.get("href")))
            elif kind == "llave": draw_llave(fl.ctx, x, yy)
            elif kind == "input":
                add_rect(fl.ctx, x, yy, w, h, fill="white", line="border", line_w=1, radius_px=12)
                add_textbox(fl.ctx, x + 14, yy, w - 28, h, [dict(runs=[(data["placeholder"], dict(pt=22 * PT, color="muted"))])], anchor="m")
            x += w + gap
        y += lh + 6
    return (y - fl.y) - 6

def blk_list(fl, node):
    px = fl.size_px; pt = px * PT
    fl.gap(0)
    of = lambda r: run_opts(r, pt, base_color=fl.color, bold_color="lemon" if fl.bloque else "leaf")
    indent = 0.30 if node["t"] == "ul" else 0.34
    paras, h = [], 0
    for k, it in enumerate(node["items"]):
        ih = para_height_px(it, pt, fl.w - indent / PX, of)
        gap_px = 0.4 * px if k < len(node["items"]) - 1 else 0
        paras.append(dict(runs=runs_to_pptx(it, of), bullet=node["t"], num=node.get("start", 1) + k, indent=indent, space_after=gap_px * PT))
        h += ih + gap_px
    add_textbox(fl.ctx, fl.x, fl.y, fl.w, h, paras, align="l")
    fl.y += h; fl.done(0.5 * px)

KEYWORDS = set("""SELECT FROM WHERE AND OR NOT IN BETWEEN LIKE IS NULL AS DISTINCT ORDER BY GROUP HAVING COUNT SUM AVG MIN MAX
INNER LEFT RIGHT JOIN ON INSERT INTO VALUES UPDATE SET DELETE CREATE TABLE INTEGER PRIMARY KEY VARCHAR DECIMAL GRANT TO
COMMIT ROLLBACK SAVEPOINT START TRANSACTION EXISTS ROUND DESC ASC ALTER DROP REVOKE""".split())

def sql_runs(code, pt):
    out = []
    tok = re.compile(r"(--[^\n]*|'[^']*'|\b\d+(?:\.\d+)?\b|\b[A-Za-z_]+\b|\n|[^\w\n'-]+|-)")
    for m in tok.finditer(code):
        s = m.group(0)
        if s == "\n": out.append(("\n", {})); continue
        o = dict(pt=pt, color="text", mono=True)
        if s.startswith("--"): o.update(color="muted", italic=True)
        elif s.startswith("'"): o.update(color="green")
        elif re.fullmatch(r'\d+(?:\.\d+)?', s): o.update(color="orange")
        elif s.upper() in KEYWORDS and s.isupper(): o.update(color="violet", bold=True)
        out.append((s, o))
    return out

def code_box(fl, code, px, pad_x, pad_y, lh=1.45, radius=14):
    lines = code.split("\n"); maxlen = max(len(l) for l in lines)
    pt = px * PT
    avail = (fl.w - 2 * pad_x) * PX
    while text_w("M" * maxlen, pt, mono=True) > avail and pt > 7: pt -= 0.25
    h = len(lines) * pt * lh / 72 / PX + 2 * pad_y
    add_rect(fl.ctx, fl.x, fl.y, fl.w, h, fill="panel", line="border", radius_px=radius)
    add_textbox(fl.ctx, fl.x + pad_x, fl.y + pad_y, fl.w - 2 * pad_x, h - 2 * pad_y, [dict(runs=sql_runs(code, pt), line_spacing=lh / 1.32)], wrap=False)
    return h

def blk_code(fl, node):
    fl.gap(0)
    if not node["run"]:
        h = code_box(fl, node["text"], 24, 22, 14); fl.y += h; fl.done(0.6 * 30); return
    # cuadro ejecutable: código + barra + resultado
    px = 19 if fl.in_cols else 20
    h = code_box(fl, node["text"], px, 18, 10, lh=1.35); fl.y += h + 6
    # barra
    bx = fl.x; bpt = 20 * PT
    w1 = text_w("▶ Ejecutar", bpt, bold=True) / PX + 32; bh = bpt * 1.3 / 72 / PX + 8
    if fl.ctx.draw:
        add_rect(fl.ctx, bx, fl.y, w1, bh, fill="orange", radius_px=11, text="▶ Ejecutar", text_opts=dict(pt=bpt, color="white", bold=True))
        w2 = text_w("↺ Original", bpt, bold=True) / PX + 32
        add_rect(fl.ctx, bx + w1 + 10, fl.y, w2, bh, fill="panel", line="border", line_w=1, radius_px=11, text="↺ Original", text_opts=dict(pt=bpt, color="text", bold=True))
        add_textbox(fl.ctx, bx + w1 + w2 + 20, fl.y, 300, bh, [dict(runs=[("Edítala y pulsa Ctrl+Intro", dict(pt=18 * PT, color="muted"))])], anchor="m")
    res = run_sql(node["text"], node["after"])
    nf = ""
    if "rows" in res: nf = f"{len(res['rows'])} fila{'s' if len(res['rows']) != 1 else ''}"
    elif "error" not in res and "arows" not in res and not re.search(r'\b(INSERT|UPDATE|DELETE|CREATE|BEGIN|START)\b', node["text"]): nf = "0 filas"
    if nf and fl.ctx.draw:
        add_textbox(fl.ctx, fl.x + fl.w - 200, fl.y, 200, bh, [dict(runs=[(nf, dict(pt=18 * PT, color="muted"))])], align="r", anchor="m")
    fl.y += bh + 6
    opt = 18 * PT if fl.in_cols else 20 * PT
    if "error" in res:
        msg = "✗ " + res["error"]
        add_textbox(fl.ctx, fl.x, fl.y, fl.w, opt * LH / 72 / PX, [dict(runs=[(msg, dict(pt=opt, color="red", bold=True))])])
        fl.y += opt * LH / 72 / PX
    elif "rows" in res:
        if not res["rows"]:
            add_textbox(fl.ctx, fl.x, fl.y, fl.w, opt * LH / 72 / PX, [dict(runs=[("La consulta no devuelve ninguna fila.", dict(pt=opt, color="muted"))])])
            fl.y += opt * LH / 72 / PX
        else:
            fl.y += result_table(fl, res["cols"], res["rows"])
    else:
        n = res.get("modified", 0)
        msg = "✓ Sentencia ejecutada" + (f" · {n} fila{'s' if n != 1 else ''} modificada{'s' if n != 1 else ''}" if n else "") + "."
        add_textbox(fl.ctx, fl.x, fl.y, fl.w, opt * LH / 72 / PX, [dict(runs=[(msg, dict(pt=opt, color="green", bold=True))])])
        fl.y += opt * LH / 72 / PX + 4
        if "arows" in res:
            add_textbox(fl.ctx, fl.x, fl.y, fl.w, opt * LH / 72 / PX, [dict(runs=[("Así queda después:", dict(pt=opt, color="muted"))])])
            fl.y += opt * LH / 72 / PX + 4
            fl.y += result_table(fl, res["acols"], res["arows"])
    fl.done(0.6 * 30)

def result_table(fl, cols, rows, max_rows=None):
    pt = 18 * PT
    cells = [[[{"text": c, "b": True}] for c in cols]] + [[[{"text": fmt(v)}] for v in r] for r in rows]
    # límite de filas por el espacio disponible (205 px de alto en la web; aquí hasta el paisaje)
    rh = pt * 1.36 / 72 / PX + 2
    avail = min(215, LIMIT_Y + 30 - fl.y)
    nmax = max(2, int((avail - rh) / rh) - (1 if len(rows) > 6 else 0))
    truncated = len(rows) > nmax
    if truncated:
        cells = cells[:1 + nmax - 1] + [[[{"text": f"… {len(rows)} filas en total", "i": True}]] + [[{"text": ""}]] * (len(cols) - 1)]
    return draw_table(fl, cells, pt, header="earth", pad_x=12, pad_y=1, min_w=380, full=False, merge_last=truncated, prefer_shrink=True)

def draw_table(fl, cells, pt, header="leaf", pad_x=16, pad_y=5, min_w=0, full=False, header_pad_y=None, merge_last=False, prefer_shrink=False):
    ncol = max(len(r) for r in cells)
    of = lambda r: run_opts(r, pt, base_color="text", bold_color="text")
    def cell_w(c, head=False):
        return sum(text_w(r["text"], of(r)["pt"], of(r)["bold"] or head, of(r)["italic"], of(r)["mono"]) / PX for r in c if "obj" not in r) or 10
    def word_w(c):  # palabra más larga: lo mínimo a lo que puede encogerse una columna
        return max([text_w(w, of(r)["pt"], True, of(r)["italic"], of(r)["mono"]) / PX for r in c if "obj" not in r for w in r["text"].split()] + [10])
    nat = [max(cell_w(row[j], i == 0) if j < len(row) else 0 for i, row in enumerate(cells)) + 2 * pad_x + 6 for j in range(ncol)]
    minw = [max(word_w(row[j]) if j < len(row) else 0 for row in cells) + 2 * pad_x + 6 for j in range(ncol)]
    total = sum(nat); W = fl.w
    if total > W and (prefer_shrink or sum(minw) > W) and pt > 7.5:
        return draw_table(fl, cells, pt - 0.5, header, pad_x, pad_y, min_w, full, header_pad_y, merge_last, prefer_shrink)
    if total > W:
        # se encogen solo las columnas con texto partible, nunca por debajo de su palabra más larga
        widths = nat[:]; excess = total - W
        wide = [j for j in range(ncol) if nat[j] - minw[j] > 1]
        slack = sum(nat[j] - minw[j] for j in wide)
        for j in wide: widths[j] = nat[j] - (nat[j] - minw[j]) / slack * excess
    else:
        widths = nat[:]
        if full or total < min_w:
            extra = (max(W if full else min_w, total) - total) / ncol; widths = [w + extra for w in widths]
    hpad = header_pad_y if header_pad_y is not None else pad_y + 1
    heights = []
    for i, row in enumerate(cells):
        h = 0
        for j, c in enumerate(row):
            cw = sum(widths) if (merge_last and i == len(cells) - 1) else widths[j]
            h = max(h, para_height_px(c, pt, cw - 2 * pad_x, of, lh=1.36))
        heights.append(h + 2 * (hpad if i == 0 else pad_y))
    H = sum(heights)
    if fl.ctx.draw:
        shp = fl.ctx.slide.shapes.add_table(len(cells), ncol, Inches(fl.x * PX), Inches(fl.y * PX), Inches(sum(widths) * PX), Inches(H * PX))
        tbl = shp.table
        tblPr = tbl._tbl.tblPr
        sid = tblPr.find(qn("a:tableStyleId"))
        if sid is None: sid = etree.SubElement(tblPr, qn("a:tableStyleId"))
        sid.text = "{2D5ABB26-0587-4C30-8999-92F81FD0307C}"
        tbl.first_row = False; tbl.horz_banding = False
        for j, w in enumerate(widths): tbl.columns[j].width = Inches(w * PX)
        for i, row in enumerate(cells):
            tbl.rows[i].height = Inches(heights[i] * PX)
            for j in range(ncol):
                cell = tbl.cell(i, j)
                cell.margin_left = cell.margin_right = Inches(pad_x * PX)
                cell.margin_top = cell.margin_bottom = Inches((hpad if i == 0 else pad_y) * PX)
                cell.vertical_anchor = MSO_ANCHOR.MIDDLE
                cell.fill.solid(); cell.fill.fore_color.rgb = rgb(header if i == 0 else "panel")
                tcPr = cell._tc.get_or_add_tcPr()
                for side in ("a:lnL", "a:lnR", "a:lnT", "a:lnB"):
                    ln = etree.SubElement(tcPr, qn(side))
                    if side == "a:lnT" and i > 0:
                        ln.set("w", "9525"); sf = etree.SubElement(ln, qn("a:solidFill")); cc = etree.SubElement(sf, qn("a:srgbClr")); cc.set("val", C["border"])
                    else:
                        ln.set("w", "0"); etree.SubElement(ln, qn("a:noFill"))
                # el relleno debe ir después de los bordes en el esquema: reordenar
                fill_el = tcPr.find(qn("a:solidFill"))
                if fill_el is not None: tcPr.remove(fill_el); tcPr.append(fill_el)
                tf = cell.text_frame; tf.word_wrap = True
                p = tf.paragraphs[0]
                c = row[j] if j < len(row) else []
                for r in c:
                    if "obj" in r: continue
                    o = of(r)
                    if i == 0: o = dict(o, bold=True, color="white")
                    set_run(p.add_run(), r["text"], **o)
        if merge_last and ncol > 1:
            tbl.cell(len(cells) - 1, 0).merge(tbl.cell(len(cells) - 1, ncol - 1))
    return H

def blk_table(fl, node):
    fl.gap(0)
    pt = (22 if fl.small else 25) * PT
    if fl.res: h = draw_table(fl, node["rows"], pt, header="earth", pad_x=14, pad_y=3, header_pad_y=4, prefer_shrink=True)
    else: h = draw_table(fl, node["rows"], pt, header="leaf", pad_x=16, pad_y=5, header_pad_y=6)
    fl.y += h; fl.done(0.6 * 30)

Flow.small = False; Flow.res = False

def blk_div(fl, node):
    cls = node["cls"]
    mt = float(node.get("style", {}).get("margin-top", "0").replace("px", ""))
    if cls & {"cols", "cols3", "cols4"}:
        fl.gap(mt); blk_cols(fl, node); return
    if "card" in cls:
        fl.gap(mt); h = card(fl, node); fl.y += h; fl.done(0); return
    if "nota" in cls or "aviso" in cls:
        fl.gap(mt + 0.4 * 27); h = nota(fl, node, "aviso" in cls); fl.y += h; fl.done(0.4 * 27); return
    if "ruta" in cls or "pasos" in cls:
        fl.gap(mt); h = ruta(fl, node, "pasos" in cls); fl.y += h; fl.done(0.6 * 30); return
    if "caja" in cls:
        fl.gap(mt); caja(fl, node); return
    # contenedores transparentes: res, sm, centro, s, autoeval, venn
    sub = fl.copy() if hasattr(fl, "copy") else None
    saved = (fl.small, fl.res, fl.align, fl.size_px)
    if "sm" in cls: fl.small = True
    if "res" in cls: fl.res = True; fl.small = True
    if "centro" in cls: fl.align = "c"
    if "s" in cls: fl.size_px = 25
    fl.gap(mt); fl.first = True
    for ch in node["children"]: block(fl, ch)
    fl.small, fl.res, fl.align, fl.size_px = saved
    fl.done(fl.last_mb)

def measure(fl_proto, node_children, x, y, w, **kw):
    """Altura de una lista de bloques sin dibujar."""
    ctx = fl_proto.ctx.copy(); ctx.draw = False
    f = Flow(ctx, x, y, w, size_px=kw.get("size_px", fl_proto.size_px), color=fl_proto.color, align=kw.get("align", fl_proto.align), bloque=fl_proto.bloque, in_cols=kw.get("in_cols", fl_proto.in_cols))
    f.small, f.res = fl_proto.small, fl_proto.res
    for ch in node_children: block(f, ch)
    return f.height()

def render_children(fl_proto, children, x, y, w, **kw):
    f = Flow(fl_proto.ctx, x, y, w, size_px=kw.get("size_px", fl_proto.size_px), color=fl_proto.color, align=kw.get("align", fl_proto.align), bloque=fl_proto.bloque, in_cols=kw.get("in_cols", fl_proto.in_cols))
    f.small, f.res = fl_proto.small, fl_proto.res
    for ch in children: block(f, ch)
    return f.height()

def blk_cols(fl, node):
    cls = node["cls"]; kids = node["children"]
    n = 3 if "cols3" in cls else 4 if "cols4" in cls else 2
    gap = {2: 32, 3: 24, 4: 18}[n]
    cw = (fl.w - gap * (n - 1)) / n
    equal = "pasos-fr" in cls or "cols4" in cls
    size_px = 25 if "s" in cls else fl.size_px
    heights = []
    for k, kid in enumerate(kids):
        x = fl.x + k * (cw + gap)
        if kid["t"] == "div" and "card" in kid["cls"]:
            heights.append(card(fl.__class__(fl.ctx.copy(), x, fl.y, cw, size_px=size_px, color=fl.color, align=fl.align, bloque=fl.bloque, in_cols=True), kid, measure_only=True))
        else:
            heights.append(measure(fl, [kid], x, fl.y, cw, in_cols=True, size_px=size_px, align="c" if kid["t"] == "div" and "centro" in kid["cls"] else fl.align))
    hmax = max(heights) if heights else 0
    for k, kid in enumerate(kids):
        x = fl.x + k * (cw + gap)
        sub = Flow(fl.ctx, x, fl.y, cw, size_px=size_px, color=fl.color, align=fl.align, bloque=fl.bloque, in_cols=True); sub.small, sub.res = fl.small, fl.res
        if kid["t"] == "div" and "card" in kid["cls"]:
            card(sub, kid, force_h=hmax if equal else None)
        else:
            block(sub, kid)
    fl.y += hmax; fl.done(0.6 * 30)

def card(fl, node, measure_only=False, force_h=None):
    pad_x, pad_y = 24, 14
    align = "c" if "centro" in node["cls"] else fl.align
    inner_h = measure(fl, node["children"], fl.x + pad_x, fl.y + pad_y, fl.w - 2 * pad_x, align=align)
    h = inner_h + 2 * pad_y
    if measure_only: return h
    H = force_h or h
    add_rect(fl.ctx, fl.x, fl.y, fl.w, H, fill="panel", line="border", radius_px=18)
    if fl.ctx.draw:
        f = Flow(fl.ctx, fl.x + pad_x, fl.y + pad_y, fl.w - 2 * pad_x, size_px=fl.size_px, color=fl.color, align=align, bloque=fl.bloque, in_cols=fl.in_cols)
        f.small, f.res = fl.small, fl.res
        for ch in node["children"]:
            if ch["t"] == "h" and ch["level"] == 3: ch = dict(ch, card=True)
            block(f, ch)
    return H

def nota(fl, node, aviso):
    pad_x, pad_y, bar = 22, 10, 8
    size_px = 27
    inner_h = measure(fl, node["children"], fl.x + bar + pad_x, fl.y + pad_y, fl.w - bar - 2 * pad_x, size_px=size_px)
    h = inner_h + 2 * pad_y
    add_rect(fl.ctx, fl.x, fl.y, fl.w, h, fill="aviso" if aviso else "nota", radius_px=12)
    add_rect(fl.ctx, fl.x, fl.y, bar, h, fill="red" if aviso else "orange", radius_px=4)
    render_children(fl, node["children"], fl.x + bar + pad_x, fl.y + pad_y, fl.w - bar - 2 * pad_x, size_px=size_px)
    return h

def ruta(fl, node, pasos):
    kids = node["children"]; boxes = [k for k in kids if not ("f" in k.get("cls", set()))]
    arrows = len(kids) - len(boxes)
    gap = 8 if pasos else 8; aw = 22 if pasos else 14
    bw = (fl.w - gap * (len(kids) - 1) - aw * arrows) / len(boxes)
    px = 22 if pasos else 20; pt = px * PT
    pad_x, pad_y = (12, 10) if pasos else (6, 12)
    # altura: la mayor
    def box_paras(k):
        if pasos:
            # <b>1 · FROM</b>texto  -> dos líneas
            b = [r for r in k["inl"] if r.get("b")][0]["text"]; rest = "".join(r["text"] for r in k["inl"] if not r.get("b") and "obj" not in r)
            return [dict(runs=[(b, dict(pt=pt, color="orange", bold=True))], space_after=4 * PT), dict(runs=[(rest, dict(pt=pt, color="text"))])], [[{"text": b, "b": True}], [{"text": rest}]]
        runs = []; lines = [[]]
        for r in k["inl"]:
            if r.get("obj") == "br": runs.append(("\n", {})); lines.append([]); continue
            runs.append((r["text"], dict(pt=pt, color="leaf" if r.get("b") else "text", bold=bool(r.get("b"))))); lines[-1].append(r)
        return [dict(runs=runs, align="c")], lines
    heights = []
    for k in boxes:
        paras, lines = box_paras(k)
        h = sum(para_height_px(l, pt, bw - 2 * pad_x, lambda r: dict(pt=pt, color="text", bold=bool(r.get("b")), italic=False, mono=False), lh=1.25) for l in lines) + (4 if pasos else 0)
        heights.append(h + 2 * pad_y)
    H = max(heights)
    x = fl.x
    for k in kids:
        if "f" in k.get("cls", set()):
            add_textbox(fl.ctx, x, fl.y, aw, H, [dict(runs=[("›", dict(pt=36 * PT, color="orange", bold=True))], align="c")], anchor="m"); x += aw + gap; continue
        paras, _ = box_paras(k)
        j = "j" in k.get("cls", set())
        if pasos: add_rect(fl.ctx, x, fl.y, bw, H, fill="panel", line="border", line_w=1.5, radius_px=14)
        else: add_rect(fl.ctx, x, fl.y, bw, H, fill="rutaj" if j else "panel", line="orange" if j else "leaf", line_w=2, radius_px=16)
        add_textbox(fl.ctx, x + pad_x, fl.y + pad_y, bw - 2 * pad_x, H - 2 * pad_y, paras, align="l" if pasos else "c", anchor="t" if pasos else "m")
        x += bw + gap
    return H

def blk_divline(fl, node):
    # hijo suelto de .ruta/.pasos fuera de contexto: no ocurre
    blk_para(fl, {"t": "p", "cls": node["cls"], "inl": node["inl"], "style": {}})

def blk_svg(fl, node):
    fl.gap(0)
    W, H = 232, 132; x0 = fl.x + (fl.w - W) / 2 if fl.align == "c" else fl.x
    v = node["variant"]; ctx = fl.ctx
    r = 54; cxl, cxr, cy = 86, 146, 66
    if ctx.draw:
        if v == "left":
            add_rect(ctx, x0 + cxl - r, fl.y + cy - r, 2 * r, 2 * r, fill="green", shape=MSO_SHAPE.OVAL)
        elif v == "right":
            add_rect(ctx, x0 + cxr - r, fl.y + cy - r, 2 * r, 2 * r, fill="green", shape=MSO_SHAPE.OVAL)
        else:  # lente de intersección como forma libre
            import math
            d = cxr - cxl; a = d / 2; hh = math.sqrt(r * r - a * a)
            pts = []
            ang0 = math.atan2(hh, a)
            for k in range(0, 41):  # arco del círculo izquierdo que queda dentro del derecho
                t = -ang0 + (2 * ang0) * k / 40; pts.append((cxl + r * math.cos(t), cy + r * math.sin(t)))
            for k in range(0, 41):
                t = math.pi - ang0 + (2 * ang0) * k / 40; pts.append((cxr + r * math.cos(t), cy + r * math.sin(t)))
            ff = ctx.slide.shapes.build_freeform(Inches((x0 + pts[0][0]) * PX), Inches((fl.y + pts[0][1]) * PX), scale=Inches(PX))
            ff.add_line_segments([(x0 + px_, fl.y + py_) for px_, py_ in pts[1:]], close=True)
            sh = ff.convert_to_shape(); sh.fill.solid(); sh.fill.fore_color.rgb = rgb("green"); sh.line.fill.background()
        for cx in (cxl, cxr):
            add_rect(ctx, x0 + cx - r, fl.y + cy - r, 2 * r, 2 * r, fill=None, line="text", line_w=2.25, shape=MSO_SHAPE.OVAL)
        add_textbox(ctx, x0 + 62 - 40, fl.y + cy - 10, 80, 20, [dict(runs=[("socio", dict(pt=14 * PT, color="text", bold=True))], align="c")], anchor="m")
        add_textbox(ctx, x0 + 170 - 40, fl.y + cy - 10, 80, 20, [dict(runs=[("entrega", dict(pt=14 * PT, color="text", bold=True))], align="c")], anchor="m")
    fl.y += H; fl.done(6)

def blk_form(fl, node):
    fl.gap(0)
    pt = 22 * PT
    h = inline_flow(fl, node["inl"], pt, lambda r: run_opts(r, pt), "l")
    fl.y += h; fl.done(12)

def blk_label(fl, node):
    fl.gap(0)
    px = 25; pt = px * PT; box = 28
    of = lambda r: run_opts(r, pt)
    h = max(para_height_px(node["inl"], pt, fl.w - box - 12, of), box)
    add_rect(fl.ctx, fl.x, fl.y + 3, box, box, fill="white", line="earth", line_w=1.25, radius_px=5)
    add_textbox(fl.ctx, fl.x + box + 12, fl.y, fl.w - box - 12, h, [dict(runs=runs_to_pptx(node["inl"], of))])
    fl.y += h; fl.done(0.6 * px)

def blk_barra(fl, node):
    fl.gap(6)
    add_rect(fl.ctx, fl.x, fl.y, fl.w, 14, fill="tint", radius_px=14)
    add_rect(fl.ctx, fl.x, fl.y, fl.w * 0.001 + 1, 14, fill="lemon", radius_px=14)
    fl.y += 14; fl.done(14)

def blk_placeholder(fl, node):
    fl.gap(0)
    if node["id"] == "insignias":
        pt = 28 * PT; names = ["Clasificador", "Detective de consultas", "Maestro del DML"]
        items = [{"obj": "pill", "cls": {"v"}, "text": n} for n in names]
        h = inline_flow(fl, items, pt / 0.78, lambda r: run_opts(r, pt), "c")
        fl.y += h; fl.done(10)
    # resumen-equipo: vacío hasta que se guarda el equipo

def blk_visor(fl, node):
    fl.gap(0)
    w, h, gap = 92, 112, 14; total = 4 * w + 3 * gap; x = fl.x + (fl.w - total) / 2
    for k in range(4):
        add_rect(fl.ctx, x + k * (w + gap), fl.y, w, h, fill="dark", line="earth", line_w=3.75, radius_px=14, text="?", text_opts=dict(pt=64 * PT, color="visor", bold=True, mono=True))
    fl.y += h; fl.done(14)

def blk_teclado(fl, node):
    fl.gap(14)
    kw, kh, gap = 74, 62, 10; cols = 6; total = cols * kw + (cols - 1) * gap; x0 = fl.x + (fl.w - total) / 2
    keys = ["1", "2", "3", "4", "5", "⌫", "6", "7", "8", "9", "0", "✓"]
    for k, key in enumerate(keys):
        r, c = divmod(k, cols); ok = key == "✓"
        add_rect(fl.ctx, x0 + c * (kw + gap), fl.y + r * (kh + gap), kw, kh, fill="green" if ok else "panel", line="earth", line_w=2.25, radius_px=14, text=key, text_opts=dict(pt=32 * PT, color="white" if ok else "text", bold=True))
    fl.y += 2 * kh + gap; fl.done(14)

def caja(fl, node):
    sub = Flow(fl.ctx, fl.x, fl.y, fl.w, size_px=fl.size_px, color=fl.color, align="c", bloque=False); sub.small, sub.res = fl.small, fl.res
    for ch in node["children"]:
        block(sub, ch)
    fl.y = sub.y; fl.done(0)

# ------------------------------------------------------------------ diapositivas
def add_bg(slide, which):
    path = {"claro": os.path.join(ROOT, "web/presentacion/fondos/fondo-claro.png"), "verde": os.path.join(ROOT, "web/presentacion/fondos/fondo-verde.png"), "portada": os.path.join(ROOT, "web/presentacion/fondos/fondo-portada.png")}[which]
    pic = slide.shapes.add_picture(path, 0, 0, Inches(10), Inches(5.625)); pic.name = "Fondo"
    return pic

def chrome(ctx, n, total, bloque):
    add_textbox(ctx, 28, 22, 500, 20, [dict(runs=[("Misión SQL · Cooperativa Huerta de Murcia", dict(pt=15 * PT, color="white" if bloque else "muted"))])])
    add_textbox(ctx, 1280 - 36 - 120, 20, 120, 24, [dict(runs=[(f"{n} / {total}", dict(pt=20 * PT, color="lemon" if bloque else "orange", bold=True))])], align="r")

def slide_portada(ctx, root):
    fl = Flow(ctx, 80, 0, 1120, color="white")
    ch = {c["t"] + str(c.get("level", "")) + "-".join(sorted(c.get("cls", []))): c for c in root["children"]}
    # kicker a 70 px, h1, h2, meta a +150, botón
    y = 70
    kick = [r for r in root["children"] if r["t"] == "p" and "kicker" in r["cls"]][0]
    txt = "".join(r["text"] for r in kick["inl"]).upper()
    add_textbox(ctx, 80, y, 1120, 36, [dict(runs=[(txt, dict(pt=27 * PT, color="lemon", bold=True))])]); y += 36 + 6
    h1 = [r for r in root["children"] if r["t"] == "h" and r["level"] == 1][0]
    runs = [(r["text"], dict(pt=118 * PT, color="lemon" if r.get("i") else "white", bold=True)) for r in h1["inl"] if "obj" not in r]
    add_textbox(ctx, 80, y, 1120, 130, [dict(runs=runs, line_spacing=0.9)]); y += 130
    h2 = [r for r in root["children"] if r["t"] == "h" and r["level"] == 2][0]
    add_textbox(ctx, 80, y, 1120, 50, [dict(runs=[("".join(r["text"] for r in h2["inl"]), dict(pt=38 * PT, color="white"))])]); y += 50
    meta = [r for r in root["children"] if r["t"] == "p" and "meta" in r["cls"]][0]
    y = 400 + 16 + 40
    of = lambda r: run_opts(r, 28 * PT)
    add_textbox(ctx, 80, y, 1120, 90, [dict(runs=runs_to_pptx(meta["inl"], of))]); y += 90
    btn = [r for r in root["children"] if r["t"] == "p" and "empezar" in r["cls"]][0]["inl"][0]
    draw_btn(ctx, 80, y, btn["text"], btn["cls"])

def slide_bloque(ctx, root):
    fl = Flow(ctx, 80, 170, 1120, size_px=32, color="white", bloque=True)
    for ch in root["children"]:
        if ch["t"] == "h" and ch["level"] == 2:
            fl.gap(0); pt = 40 * PT
            add_textbox(ctx, 80, fl.y, 1120, 56, [dict(runs=[("".join(r["text"] for r in ch["inl"]), dict(pt=pt, color="lemon", bold=True))])]); fl.y += 56 + 18; fl.done(0)
        elif ch["t"] == "h" and ch["level"] == 1:
            pt = 84 * PT; h = pt * 1.15 / 72 / PX
            add_textbox(ctx, 80, fl.y, 1120, h, [dict(runs=[("".join(r["text"] for r in ch["inl"]), dict(pt=pt, color="white", bold=True))], line_spacing=0.9)]); fl.y += h + 10
        else:
            fl.w = 900; block(fl, ch); fl.w = 1120

def build():
    md = open(os.path.join(ROOT, "web/presentacion/slides.md"), encoding="utf-8").read()
    srcs = md.split("\n---\n")
    prs = Presentation(); prs.slide_width = Inches(10); prs.slide_height = Inches(5.625)
    blank = prs.slide_layouts[6]
    total = len(srcs); report = []
    for n, src in enumerate(srcs, 1):
        classes, root, notes = parse_slide(src)
        slide = prs.slides.add_slide(blank)
        bloque = "bloque" in classes; portada = "portada" in classes
        add_bg(slide, "portada" if portada else "verde" if bloque else "claro")
        ctx = Ctx(slide)
        extra = []
        if portada:
            slide_portada(ctx, root)
            extra.append("La portada de la web tiene un botón «Comenzar la misión» que pasa a la siguiente diapositiva.")
        elif bloque:
            chrome(ctx, n, total, True); slide_bloque(ctx, root)
        else:
            chrome(ctx, n, total, False)
            fl = Flow(ctx, 80, 58, 1120)
            if "juego" in classes:
                # h1 naranja con "Juego n ·" en verde
                h1 = root["children"][0]; root["children"] = root["children"][1:]
                pt = 50 * PT
                runs = [(r["text"], dict(pt=pt, color=r.get("color", "orange"), bold=True)) for r in h1["inl"] if "obj" not in r]
                add_textbox(ctx, 80, 58, 1120, 60, [dict(runs=runs, line_spacing=0.9)]); fl.y = 58 + 60 + 0.35 * 50; fl.first = False; fl.last_mb = 0
                fl.y = 58 + pt * 1.25 / 72 / PX; fl.done(0.35 * 50)
            for ch in root["children"]:
                if ch["t"] == "p" and "bloqueada" in ch["cls"]:
                    extra.append("En la web, el contenido de esta diapositiva está oculto hasta que se abre la caja fuerte; solo se ve el aviso «Esta diapositiva se desbloquea al abrir la caja fuerte».")
                    continue
                block(fl, ch)
            report.append((n, round(fl.y)))
        # notas: las del guion + lo interactivo
        src_l = src
        if "--run" in src_l: extra.append("Los cuadros de consulta son ejecutables en la web (SQLite en el navegador): el alumnado puede editarlos y volver a ejecutarlos. Aquí se muestra la consulta y su resultado real.")
        for m in re.finditer(r'data-sol="([^"]+)"', src_l): extra.append("Solución del reto (botón «Ver la solución» en la web): " + html.unescape(m.group(1)))
        if 'class="llave"' in src_l: extra.append("Las casillas de la llave se rellenan solas en la web con el dígito que guarda el juego al superarlo.")
        if "form-equipo" in src_l: extra.append("En la web, el formulario guarda el nombre de la pareja y debajo aparece su resumen (puntos e insignias).")
        if 'id="caja"' in src_l: extra.append("Caja fuerte interactiva: el código correcto es 2931 (juego 1 → 2, juego 2 → 9, juego 3 → 3 y 1). Con el código erróneo se sacude y muestra una pista; con el correcto pasa a «¡Campaña salvada!».")
        enlaces = [(html.unescape(t).strip(), abs_url(h)) for h, t in re.findall(r'<a (?!class="btn)[^>]*href="([^"]+)"[^>]*>(.*?)</a>', src_l)] + [(t, abs_url(h)) for t, h in re.findall(r'\[([^\]]+)\]\(([^)]+)\)', src_l)]
        for t, u in enlaces:
            if u: extra.append(f"Enlace del texto «{t}»: {u}")
        for h, t in re.findall(r'<a class="btn[^"]*" href="([^"]+)"[^>]*>(.*?)</a>', src_l):
            if abs_url(h): extra.append(f"Botón «{html.unescape(t).strip()}»: {abs_url(h)}")
        if "autoeval" in src_l: extra.append("En la web las casillas se pueden marcar y la barra de progreso se rellena.")
        if 'id="insignias"' in src_l: extra.append("Las insignias y los puntos finales se rellenan con el progreso real de la pareja.")
        txt = (notes + "\n\n" if notes else "") + "\n".join("• " + e for e in extra)
        if txt.strip(): slide.notes_slide.notes_text_frame.text = txt.strip()
    prs.save(OUT)
    return report, total

if __name__ == "__main__":
    report, total = build()
    print(OUT, total, "diapositivas")
    for n, y in report:
        flag = "  <-- pasa de %d" % LIMIT_Y if y > LIMIT_Y else ""
        print(f"  {n:2d}: contenido hasta y={y}{flag}")
