#!/usr/bin/env python3
"""Build the three TFM PDFs from versioned content. Requires reportlab."""
import json
import os
import re
from pathlib import Path
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, PageBreak, NextPageTemplate, Table, TableStyle, Image, KeepTogether, Flowable
from reportlab.platypus.tableofcontents import TableOfContents

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'docs/tfm/source'
OUT = ROOT / 'output/pdf'
OUT.mkdir(parents=True, exist_ok=True)
NAVY = colors.HexColor('#122638')
GOLD = colors.HexColor('#BD9450')
TEAL = colors.HexColor('#14757A')
INK = colors.HexColor('#243748')
MUTED = colors.HexColor('#586A79')
PALE = colors.HexColor('#EDF2F5')
LINE = colors.HexColor('#D5DFE5')
FONT, BOLD = 'Helvetica', 'Helvetica-Bold'
for directory, regular, bold in [
    (os.getenv('PDF_FONT_DIR', ''), 'DejaVuSans.ttf', 'DejaVuSans-Bold.ttf'),
    ('/usr/share/fonts/truetype/dejavu', 'DejaVuSans.ttf', 'DejaVuSans-Bold.ttf'),
    ('/System/Library/Fonts/Supplemental', 'Arial.ttf', 'Arial Bold.ttf'),
]:
    if directory and (Path(directory)/regular).exists() and (Path(directory)/bold).exists():
        pdfmetrics.registerFont(TTFont('Body', str(Path(directory)/regular)))
        pdfmetrics.registerFont(TTFont('BodyBold', str(Path(directory)/bold)))
        pdfmetrics.registerFontFamily('Body', normal='Body', bold='BodyBold', italic='Body', boldItalic='BodyBold')
        FONT, BOLD = 'Body', 'BodyBold'
        break

STYLES = {
    'body': ParagraphStyle('body', fontName=FONT, fontSize=10.8, leading=16.4, textColor=INK, spaceAfter=9, allowWidows=0),
    'title': ParagraphStyle('title', fontName=BOLD, fontSize=36, leading=42, textColor=NAVY, spaceAfter=18),
    'subtitle': ParagraphStyle('subtitle', fontName=FONT, fontSize=16, leading=24, textColor=MUTED, spaceAfter=16),
    'section': ParagraphStyle('section', fontName=BOLD, fontSize=17, leading=22, textColor=NAVY, spaceBefore=22, spaceAfter=12, keepWithNext=True),
    'bullet': ParagraphStyle('bullet', fontName=FONT, fontSize=10.6, leading=16, textColor=INK, leftIndent=12, firstLineIndent=-9, spaceAfter=6),
    'cell': ParagraphStyle('cell', fontName=FONT, fontSize=9.1, leading=13.3, textColor=INK),
    'head': ParagraphStyle('head', fontName=BOLD, fontSize=9.2, leading=13.3, textColor=colors.white),
    'caption': ParagraphStyle('caption', fontName=FONT, fontSize=9.1, leading=13.5, textColor=MUTED, spaceAfter=13),
    'toc': ParagraphStyle('toc', fontName=FONT, fontSize=10.2, leading=14.5, textColor=INK, spaceAfter=2),
}

def clean(value):
    return str(value).replace('\u2011', '-').replace('\u2013', '-').replace('\u2014', '-').replace('\u00a0', ' ')

def rich(value):
    text = escape(clean(value))
    text = re.sub(r'`([^`]+)`', r'<b>\1</b>', text)
    text = re.sub(r'\*\*([^*]+)\*\*', r'<b>\1</b>', text)
    text = re.sub(r'\[([^\]]+)\]\((https?://[^)]+)\)', r'<link href="\2" color="#14757A">\1</link>', text)
    if text.startswith('https://') and not any(c.isspace() for c in text):
        text = f'<link href="{text}" color="#14757A">{text}</link>'
    return text.replace('\n', '<br/>')

def p(text, style='body'):
    return Paragraph(rich(text), STYLES[style])

class Document(BaseDocTemplate):
    def __init__(self, filename, title, label):
        super().__init__(str(filename), pagesize=A4, rightMargin=49, leftMargin=49, topMargin=54, bottomMargin=52, title=title, author='Roberto Casabán', subject='Máster de desarrollo con IA · BIG school')
        self.label = label
        frame = Frame(self.leftMargin, self.bottomMargin, self.width, self.height, id='main', leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
        self.addPageTemplates(PageTemplate(id='all', frames=frame, onPage=self.decorate))
        landscape_size = (A4[1], A4[0])
        landscape_frame = Frame(49, 52, landscape_size[0]-98, landscape_size[1]-106, id='wide', leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
        self.addPageTemplates(PageTemplate(id='landscape', pagesize=landscape_size, frames=landscape_frame, onPage=self.decorate))
    def decorate(self, c, doc):
        c.saveState()
        page_width, page_height = doc.pageTemplate.pagesize or doc.pagesize
        if doc.page == 1:
            c.setFillColor(NAVY)
            c.rect(0, A4[1]-34, A4[0], 34, fill=1, stroke=0)
            c.setFillColor(GOLD)
            c.rect(49, A4[1]-61, 50, 4, fill=1, stroke=0)
        else:
            c.setFillColor(NAVY); c.setFont(BOLD, 8)
            c.drawString(49, page_height-29, 'AGENTE BOE')
            c.setFillColor(MUTED); c.setFont(FONT, 8)
            c.drawRightString(page_width-49, page_height-29, self.label)
            c.setStrokeColor(LINE); c.line(49, page_height-39, page_width-49, page_height-39)
        c.setFont(FONT, 8); c.setFillColor(MUTED)
        c.drawString(49, 27, 'Roberto Casabán · 7 de octubre de 2026')
        c.drawRightString(page_width-49, 27, str(doc.page))
        c.restoreState()
    def afterFlowable(self, flowable):
        if isinstance(flowable, Paragraph) and flowable.style.name == 'section':
            title = flowable.getPlainText()
            key = 'section-' + str(self.seq.nextf('section'))
            self.canv.bookmarkPage(key)
            self.canv.addOutlineEntry(title, key, 0, False)
            self.notify('TOCEntry', (0, title, self.page, key))

def table(data, width):
    heads, rows = (data[0], data[1:]) if isinstance(data, list) else (data['headers'], data['rows'])
    n = len(heads)
    ratios = data.get('widths') if isinstance(data, dict) else None
    ratios = ratios or {2:[.31,.69],3:[.23,.44,.33],4:[.19,.27,.28,.26]}.get(n, [1/n]*n)
    cells = [[p(x, 'head') for x in heads]] + [[p(x, 'cell') for x in row] for row in rows]
    t = Table(cells, colWidths=[width*x for x in ratios], repeatRows=1, hAlign='LEFT')
    t.setStyle(TableStyle([
        ('BACKGROUND',(0,0),(-1,0),NAVY),('VALIGN',(0,0),(-1,-1),'TOP'),
        ('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white, PALE]),
        ('LEFTPADDING',(0,0),(-1,-1),9),('RIGHTPADDING',(0,0),(-1,-1),9),
        ('TOPPADDING',(0,0),(-1,-1),8),('BOTTOMPADDING',(0,0),(-1,-1),8),
        ('LINEBELOW',(0,1),(-1,-1),.35,LINE),
        ('NOSPLIT',(0,-2),(-1,-1)),
    ]))
    return t

def screenshot(path, width, caption=None, maxheight=305):
    source = ROOT/path
    if not source.exists():
        raise FileNotFoundError(source)
    iw, ih = ImageReader(str(source)).getSize()
    scale = min(width/iw, maxheight/ih)
    parts = [Spacer(1,7), Image(str(source), width=iw*scale, height=ih*scale, hAlign='CENTER')]
    if caption: parts.append(p(caption, 'caption'))
    return [KeepTogether(parts)]

class CommercialFunnel(Flowable):
    """Observed navigation and community, followed by an unmeasured sales goal."""
    def __init__(self, width, presentation=False):
        super().__init__(); self.width=width; self.height=305; self.presentation=presentation
    def draw(self):
        c=self.canv; w=self.width; gap=32; bw=(w-gap)/2
        def box(x,y,width,height,title,body):
            c.setFillColor(PALE); c.roundRect(x,y,width,height,7,fill=1,stroke=0)
            style=ParagraphStyle('funnel-title',fontName=BOLD,fontSize=16 if self.presentation else 11,leading=19 if self.presentation else 14,textColor=NAVY)
            q=Paragraph(rich(title),style);qw,qh=q.wrap(width-24,height);q.drawOn(c,x+12,y+height-12-qh)
            title_height=qh
            style=ParagraphStyle('funnel-body',fontName=FONT,fontSize=12.5 if self.presentation else 9.3,leading=16 if self.presentation else 12.8,textColor=INK)
            q=Paragraph(rich(body),style);qw,qh=q.wrap(width-24,height);q.drawOn(c,x+12,y+height-18-title_height-qh)
        def arrow(x1,y1,x2,y2,dashed=False):
            c.setStrokeColor(TEAL);c.setLineWidth(1.5);c.setDash(4,3) if dashed else c.setDash()
            c.line(x1,y1,x2,y2);c.setDash()
            if y1==y2:
                c.line(x2,y2,x2-5,y2+4);c.line(x2,y2,x2-5,y2-4)
            else:
                d=1 if y2>y1 else -1
                c.line(x2,y2,x2-4,y2-5*d);c.line(x2,y2,x2+4,y2-5*d)
        box(0,245,w,57,'Descubrimiento','Buscadores y redes → lectura de información gratuita')
        arrow(bw/2,245,bw/2,224)
        box(0,151,bw,73,'agenteboe.com','Catálogo, fichas, datos públicos y juego')
        box(bw+gap,151,bw,73,'Comunidad compartida','Telegram: AgenteBoe + Finanfocus · 1.560 suscriptores en la captura')
        arrow(bw,187,bw+gap,187)
        arrow(bw/2,151,bw/2,125)
        arrow(bw/2+18,125,bw/2+18,151)
        box(0,57,w,68,'finanfocus.com','Menús en ambos sentidos y premio PRO → producto financiero, prueba y cuenta gratuita')
        arrow(w/2,57,w/2,39,True)
        c.setFillColor(TEAL);c.setFont(BOLD,12 if self.presentation else 8.8)
        c.drawCentredString(w/2,19,'Objetivo comercial: suscripción PRO. Conversión y ventas pendientes de medición.')

class Architecture(Flowable):
    def __init__(self, width, presentation=False):
        super().__init__(); self.width=width; self.height=300; self.presentation=presentation
    def draw(self):
        c=self.canv; w=self.width
        def box(x,y,bw,bh,label,detail,fill=PALE):
            c.setFillColor(fill); c.roundRect(x,y,bw,bh,7,fill=1,stroke=0)
            c.setFillColor(NAVY); c.setFont(BOLD,14 if self.presentation else 10); c.drawString(x+12,y+bh-19,label)
            style=ParagraphStyle('diagram',fontName=FONT,fontSize=12 if self.presentation else 8.8,leading=15 if self.presentation else 12,textColor=INK)
            q=Paragraph(detail,style); qw,qh=q.wrap(bw-24,bh-32); q.drawOn(c,x+12,y+bh-34-qh)
        def arrow(x1,y1,x2,y2):
            c.setStrokeColor(TEAL); c.setLineWidth(1.2); c.line(x1,y1,x2,y2)
            if x1==x2:
                d=-1 if y2<y1 else 1;c.line(x2,y2,x2-4,y2-6*d);c.line(x2,y2,x2+4,y2-6*d)
            else:
                c.line(x2,y2,x2-6,y2-4);c.line(x2,y2,x2-6,y2+4)
        bw=(w-30)/3
        for i,(a,b) in enumerate([('1. Ingesta BOE','Texto y metadatos oficiales'),('2. IA y revisión','Resumen estructurado'),('3. Catálogo + avisos','Proyección y distribución')]):
            box(i*(bw+15),231,bw,63,a,b)
        arrow(bw,263,bw+15,263);arrow(2*bw+15,263,2*bw+30,263)
        box(0,129,w,75,'API Fastify + PostgreSQL','Módulos con esquemas propios · catálogo de lectura · cuentas, permisos y sesiones · asistente con fuentes')
        arrow(w/2,231,w/2,204)
        box(0,12,(w-16)/2,88,'AgenteBOE · núcleo','Next.js: boletines, fichas y BoeBot.<br/>Contenido oficial y explicación generada identificados.')
        box((w+16)/2,12,(w-16)/2,88,'Electricidad · complemento','Sesión y permiso de estudio.<br/>Cuaderno, tests, simulacros y tutor contextual integrado.')
        arrow(w*.24,129,w*.24,100);arrow(w*.76,129,w*.76,100)

def section_flow(section, width):
    if section.get('image'):
        if section.get('landscape'):
            group = [p(section['title'], 'section')]
            group += [p(text) for text in section.get('paragraphs', [])]
            group += screenshot(section['image'], A4[1]-98, section.get('caption'), maxheight=355)
            return [NextPageTemplate('landscape'), PageBreak(), KeepTogether(group), NextPageTemplate('all'), PageBreak()]
        group = [p(section['title'], 'section')]
        group += [p(text) for text in section.get('paragraphs', [])]
        group += screenshot(section['image'], width, section.get('caption'), maxheight=430)
        if section.get('detail_image'):
            group += screenshot(section['detail_image'], width, section.get('detail_caption'), maxheight=130)
        return ([PageBreak()] if section.get('page_break') else []) + [KeepTogether(group)]
    story = [PageBreak()] if section.get('page_break') else []
    story.append(p(section['title'], 'section'))
    for text in section.get('paragraphs', []): story.append(p(text))
    for text in section.get('bullets', []): story.append(p('- '+text, 'bullet'))
    if section.get('diagram') == 'architecture': story += [Architecture(width), Spacer(1,10)]
    if section.get('diagram') == 'funnel': story += [KeepTogether([CommercialFunnel(width)]), Spacer(1,10)]
    if section.get('table'):
        item=table(section['table'],width)
        story += [KeepTogether([item]) if section.get('keep_table') else item, Spacer(1,12)]
    for item in section.get('tables', []): story += [table(item, width), Spacer(1,12)]
    return story

def document(source, output, label, subtitle):
    data=json.loads((SOURCE/source).read_text())
    doc=Document(OUT/output, data['title'], label)
    story=[Spacer(1,43),p('MÁSTER DE DESARROLLO CON IA · BIG SCHOOL','caption'),p(data['title'],'title'),p(subtitle,'subtitle'),p('Roberto Casabán','body'),Spacer(1,14)]
    story += [Architecture(doc.width)] if source=='memoria.json' else [p('Proyecto principal: AgenteBOE\nAmpliación integrada: Electricidad','subtitle'),Spacer(1,34)]
    story += [Spacer(1,15),p('Edición revisada · 7 de octubre de 2026','caption'),p('Fuentes, decisiones y resultados verificables. Vídeo personal pendiente de grabación por el autor.','caption'),PageBreak(),p('Contenido','title')]
    toc=TableOfContents();toc.levelStyles=[STYLES['toc']];story += [toc,PageBreak()]
    for s in data['sections']: story += section_flow(s,doc.width)
    if source=='memoria.json':
        ev=json.loads((SOURCE/'verificacion.json').read_text())
        if ev.get('sections'):
            for s in ev['sections']: story+=section_flow(s,doc.width)
        else:
            story+=section_flow({'title':'Anexo. Verificación de la edición','paragraphs':ev.get('paragraphs',[]),'table':ev.get('table'),'page_break':True,'keep_table':True},doc.width)
        for s in json.loads((SOURCE/'capturas.json').read_text())['sections']: story+=section_flow(s,doc.width)
    doc.multiBuild(story)
    print(str(OUT/output))

def slides():
    data=json.loads((SOURCE/'slides.json').read_text())
    w,h=960,540
    c=canvas.Canvas(str(OUT/'Presentacion-Agente-BOE.pdf'),pagesize=(w,h))
    c.setTitle('AgenteBOE · Presentación del TFM');c.setAuthor('Roberto Casabán')
    def para(text,x,y,width,size=20,bold=False,color=INK,leading=None):
        style=ParagraphStyle('slide',fontName=BOLD if bold else FONT,fontSize=size,leading=leading or size*1.35,textColor=color)
        q=Paragraph(rich(text),style);qw,qh=q.wrap(width,h)
        if y-qh<48: raise ValueError(f'Slide text overflow: {text[:60]}')
        q.drawOn(c,x,y-qh);return y-qh
    for number,s in enumerate(data['slides'],1):
        dark=s.get('dark',False)
        c.setFillColor(NAVY if dark else colors.white);c.rect(0,0,w,h,fill=1,stroke=0)
        fg=colors.white if dark else NAVY
        c.setFillColor(GOLD);c.rect(48,h-49,44,4,fill=1,stroke=0)
        para(s.get('eyebrow','AGENTE BOE · TRABAJO FINAL'),108,h-33,790,10,True,GOLD)
        title_y=para(s['title'],48,h-81,870,32,True,fg,37)
        top=title_y-24
        if s.get('app_icons'):
            y=top
            for text in s.get('bullets',[]):y=para(text,48,y,300,18,color=colors.white if dark else INK)-18
            for column,item in enumerate(s['app_icons']):
                x=415+column*250
                c.drawImage(str(ROOT/item['path']),x,top-170,width=150,height=150,mask='auto')
                para(item['label'],x-20,top-190,220,20,True,fg)
        elif s.get('diagram') == 'funnel':
            a=CommercialFunnel(860,presentation=True);a.canv=c;c.saveState();c.translate(50,67);a.draw();c.restoreState()
        elif s.get('wide_image'):
            im=ROOT/s['wide_image'];iw,ih=ImageReader(str(im)).getSize();scale=min(864/iw,(top-84)/ih)
            c.drawImage(str(im),(w-iw*scale)/2,top-ih*scale,width=iw*scale,height=ih*scale,mask='auto')
            if s.get('callout'):para(s['callout'],48,70,864,12,False,TEAL,16)
        elif s.get('screens'):
            for index,item in enumerate(s['screens']):
                x=48+index*440; para(item['label'],x,top,420,17,True,TEAL)
                im=ROOT/item['path'];iw,ih=ImageReader(str(im)).getSize();scale=min(420/iw,(top-105)/ih)
                c.drawImage(str(im),x,top-34-ih*scale,width=iw*scale,height=ih*scale,mask='auto')
            if s.get('callout'):para(s['callout'],48,72,864,14,True,TEAL,18)
        elif s.get('diagram'):
            a=Architecture(860,presentation=True);a.canv=c;c.saveState();c.translate(50,73);a.draw();c.restoreState()
        elif s.get('image'):
            im=ROOT/s['image'];iw,ih=ImageReader(str(im)).getSize();scale=min(525/iw,(top-75)/ih)
            c.drawImage(str(im),385,top-ih*scale,width=iw*scale,height=ih*scale,mask='auto')
            y=top
            for text in s.get('bullets',[]):y=para(text,48,y,299,18,color=colors.white if dark else INK)-18
        else:
            y=top
            for text in s.get('bullets',[]):y=para(text,48,y,840,21,color=colors.white if dark else INK)-18
            if s.get('callout'):para(s['callout'],48,max(115,y-6),830,17,True,GOLD if dark else TEAL)
        c.setFillColor(GOLD if dark else MUTED);c.setFont(FONT,10)
        c.drawString(48,25,'Roberto Casabán · Máster de desarrollo con IA · 07/10/2026')
        c.drawRightString(912,25,f'{number:02d} / {len(data["slides"]):02d}')
        c.showPage()
    c.save();print(str(OUT/'Presentacion-Agente-BOE.pdf'))

if __name__=='__main__':
    document('memoria.json','Memoria-Agente-BOE.pdf','Memoria técnica','Información oficial, resúmenes con IA y un módulo complementario de Electricidad')
    document('guia.json','Guia-Evaluacion-Grabacion-Entrega.pdf','Evaluación y grabación','Manual del evaluador, guion de defensa y preparación de la entrega')
    slides()
