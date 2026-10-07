#!/usr/bin/env python3
"""Generate the two personal recording/submission aids, without changing the TFM PDFs."""
import json
from pathlib import Path

from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph, Spacer, PageBreak, KeepTogether

from build_tfm_docs import Document, OUT, SOURCE, FONT, BOLD, NAVY, TEAL, INK, MUTED, rich

STYLES = {
    'title': ParagraphStyle('personal-title', fontName=BOLD, fontSize=26, leading=31, textColor=NAVY, spaceAfter=10),
    'subtitle': ParagraphStyle('personal-subtitle', fontName=FONT, fontSize=11.3, leading=16, textColor=MUTED, spaceAfter=13),
    'label': ParagraphStyle('personal-label', fontName=BOLD, fontSize=9.5, leading=13, textColor=TEAL, spaceAfter=11),
    'heading': ParagraphStyle('personal-heading', fontName=BOLD, fontSize=13, leading=18, textColor=NAVY, spaceBefore=12, spaceAfter=7, keepWithNext=True),
    'body': ParagraphStyle('personal-body', fontName=FONT, fontSize=11.2, leading=16.2, textColor=INK, spaceAfter=7),
    'action': ParagraphStyle('personal-action', fontName=FONT, fontSize=10.3, leading=14.5, textColor=TEAL, spaceAfter=10),
    'bullet': ParagraphStyle('personal-bullet', fontName=FONT, fontSize=10.5, leading=15.2, textColor=INK, leftIndent=11, firstLineIndent=-9, spaceAfter=6),
    'step': ParagraphStyle('personal-step', fontName=FONT, fontSize=10.6, leading=14.6, textColor=INK, spaceAfter=12),
    'link': ParagraphStyle('personal-link', fontName=FONT, fontSize=10.1, leading=14.5, textColor=TEAL, spaceAfter=4),
}


def paragraph(text, style='body'):
    return Paragraph(rich(text), STYLES[style])


def build_script():
    data = json.loads((SOURCE / 'guion-grabacion.json').read_text())
    output = OUT / 'Guion-Grabacion-Agente-BOE.pdf'
    doc = Document(output, data['title'], 'Guion de grabación')
    story = []
    for index, page in enumerate(data['pages']):
        if index:
            story.append(PageBreak())
        else:
            story.extend([Spacer(1, 18), paragraph(data['title'], 'title'), paragraph(data['subtitle'], 'subtitle')])
        story.extend([paragraph(page['title'], 'heading'), paragraph(page['eyebrow'], 'label')])
        for section in page['sections']:
            story.append(paragraph(section['heading'], 'heading'))
            if section.get('action'):
                story.append(paragraph('**En pantalla:** ' + section['action'], 'action'))
            for text in section.get('speech', []):
                story.append(paragraph(text))
            for text in section.get('bullets', []):
                story.append(paragraph('- ' + text, 'bullet'))
    doc.build(story)
    print(output)


def build_steps():
    data = json.loads((SOURCE / 'pasos-finalizar.json').read_text())
    output = OUT / 'Pasos-Finalizar-TFM-Agente-BOE.pdf'
    doc = Document(output, data['title'], 'Lista para completar la entrega')
    story = [Spacer(1, 18), paragraph(data['title'], 'title'), paragraph(data['subtitle'], 'subtitle')]
    for number, step in enumerate(data['steps'], 1):
        story.append(KeepTogether([paragraph(f'**{number}. {step["title"]}.** {step["text"]}', 'step')]))
    story.append(paragraph('Enlaces para la entrega', 'heading'))
    for resource in data['resources']:
        story.append(paragraph(f'[{resource["label"]}]({resource["url"]})', 'link'))
    doc.build(story)
    print(output)


if __name__ == '__main__':
    build_script()
    build_steps()
