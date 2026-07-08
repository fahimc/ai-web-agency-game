import { jsPDF } from 'jspdf';
import { outputNames } from '../data/outputs.js';

export function createProjectPdf(state) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const margin = 48;
  const pageBottom = 760;
  const contentWidth = 500;
  let y = 54;

  const ensurePage = (height = 18) => {
    if (y + height > pageBottom) {
      doc.addPage();
      y = 54;
    }
  };

  const write = (text, options = {}) => {
    const size = options.size || 10;
    const lineHeight = options.lineHeight || size * 1.35;
    doc.setFont('helvetica', options.bold ? 'bold' : 'normal');
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(cleanInlineMarkdown(text), options.width || contentWidth);
    lines.forEach((line) => {
      ensurePage(lineHeight);
      doc.text(line, margin, y);
      y += lineHeight;
    });
    y += options.after || 8;
  };

  const writeMarkdown = (markdown, options = {}) => {
    const lines = String(markdown || '').replace(/\r\n/g, '\n').split('\n');
    lines.forEach((rawLine) => {
      const line = rawLine.trim();
      if (!line) {
        y += 6;
        return;
      }

      const heading = line.match(/^(#{1,3})\s+(.+)$/);
      if (heading) {
        const level = heading[1].length;
        write(heading[2], {
          size: level === 1 ? 14 : level === 2 ? 12 : 10.5,
          bold: true,
          after: level === 1 ? 5 : 3,
        });
        return;
      }

      const bullet = line.match(/^[-*]\s+(.+)$/);
      if (bullet) {
        writeBullet(bullet[1], options);
        return;
      }

      const numbered = line.match(/^\d+[.)]\s+(.+)$/);
      if (numbered) {
        writeBullet(numbered[1], options);
        return;
      }

      write(line, { size: options.size || 9.5, after: 4 });
    });
    y += 6;
  };

  const writeBullet = (text, options = {}) => {
    const size = options.size || 9.5;
    const lineHeight = size * 1.35;
    const bulletX = margin + 8;
    const textX = margin + 24;
    const lines = doc.splitTextToSize(cleanInlineMarkdown(text), contentWidth - 24);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(size);
    lines.forEach((line, index) => {
      ensurePage(lineHeight);
      if (index === 0) doc.text('-', bulletX, y);
      doc.text(line, textX, y);
      y += lineHeight;
    });
    y += 2;
  };

  const writeKeyValues = (text) => {
    String(text || '').split('\n').forEach((line) => {
      const match = line.match(/^([^:]+):\s*(.*)$/);
      if (!match) {
        writeMarkdown(line);
        return;
      }
      ensurePage(16);
      doc.setFontSize(9.5);
      doc.setTextColor(33, 22, 15);
      doc.setFont('helvetica', 'bold');
      doc.text(cleanInlineMarkdown(match[1]), margin, y);
      doc.setFont('helvetica', 'normal');
      const valueLines = doc.splitTextToSize(cleanInlineMarkdown(match[2]), 330);
      valueLines.forEach((valueLine, index) => {
        if (index > 0) {
          y += 13;
          ensurePage(16);
        }
        doc.text(valueLine || '-', margin + 160, y);
      });
      y += 16;
    });
    y += 8;
  };

  doc.setFillColor(45, 27, 18);
  doc.rect(0, 0, 595, 92, 'F');
  doc.setTextColor(255, 247, 233);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('MicroAgency AI', margin, 42);
  doc.setFontSize(12);
  doc.text('Project handover pack', margin, 64);

  doc.setTextColor(33, 22, 15);
  y = 126;
  write(`Prepared for: ${state.userName || 'Client'}${state.email ? ` (${state.email})` : ''}`, { size: 12, bold: true });
  write(`Generated: ${new Date().toLocaleString()}`, { size: 9 });
  write('Project Intake', { size: 16, bold: true, after: 4 });
  writeKeyValues(state.clientDetails || state.brief || 'No intake details saved yet.');

  ['Plan', 'TaskBoard', 'DesignDirection', 'QAReport'].forEach((key) => {
    if (!state.outputs[key]) return;
    write(outputNames[key], { size: 15, bold: true, after: 4 });
    writeMarkdown(state.outputs[key].slice(0, 4500), { size: 9.5 });
  });

  write('Handover Summary', { size: 16, bold: true, after: 4 });
  write('Your project pack includes the approved website preview, QA notes, and the core planning details used by the studio.', { size: 10 });

  return doc.output('datauristring');
}

function cleanInlineMarkdown(value) {
  return String(value || '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
    .replace(/<br\s*\/?>/gi, ' ')
    .trim();
}
