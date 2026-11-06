import path from 'path';
import PDFDocument from 'pdfkit';
import { AnalyticsData, AnalyticsQuestion, Poll } from '../types';

interface WrittenResponse {
  id: string;
  questionId: string;
  text: string;
  createdAt: Date;
}

interface PollReportData {
  analytics: AnalyticsData;
  writtenResponses: WrittenResponse[];
}

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const LEFT = 48;
const RIGHT = PAGE_WIDTH - 48;
const CONTENT_TOP = 136;
const LOGO_PATH = path.resolve(__dirname, '../../assets/logo.png');
const COLORS = {
  ink: '#172033',
  muted: '#64748B',
  green: '#75D34F',
  greenTrack: '#DCEFD5',
  navy: '#0B111C',
  line: '#E2E8F0',
  panel: '#F5F8FB',
};

const formatPercentage = (value: number) => `${value.toFixed(1)}%`;
const formatDate = (value: Date) => value.toLocaleDateString(undefined, {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});
const formatDateTime = (value: Date) => value.toLocaleString(undefined, {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const drawHeader = (document: PDFKit.PDFDocument, title = 'POLL RESULTS REPORT', subtitle = 'A complete summary of recorded responses') => {
  document.save();
  document.rect(0, 0, PAGE_WIDTH, 112).fill(COLORS.navy);
  document.image(LOGO_PATH, LEFT, 10, { fit: [104, 88] });
  document.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(17)
    .text(title, 170, 35, { width: 360 });
  document.fillColor('#CBD5E1').font('Helvetica').fontSize(9)
    .text(subtitle, 171, 61, { width: 350 });
  document.rect(0, 112, PAGE_WIDTH, 4).fill(COLORS.green);
  document.restore();
  document.x = LEFT;
  document.y = CONTENT_TOP;
};

const addPageWithHeader = (document: PDFKit.PDFDocument) => {
  document.addPage();
  drawHeader(document);
};

const ensureSpace = (document: PDFKit.PDFDocument, height: number) => {
  if (document.y + height > document.page.height - document.page.margins.bottom) {
    addPageWithHeader(document);
  }
};

const writeTextAcrossPages = (document: PDFKit.PDFDocument, value: string, width: number) => {
  let words = value.trim().split(/\s+/).filter(Boolean);
  while (words.length > 0) {
    const available = document.page.height - document.page.margins.bottom - document.y;
    if (available < 18) {
      addPageWithHeader(document);
      continue;
    }

    let low = 1;
    let high = words.length;
    let fittingCount = 0;
    while (low <= high) {
      const middle = Math.floor((low + high) / 2);
      const candidate = words.slice(0, middle).join(' ');
      if (document.heightOfString(candidate, { width }) <= available - 4) {
        fittingCount = middle;
        low = middle + 1;
      } else {
        high = middle - 1;
      }
    }

    if (fittingCount === 0) {
      addPageWithHeader(document);
      continue;
    }

    document.text(words.slice(0, fittingCount).join(' '), { width });
    words = words.slice(fittingCount);
    if (words.length > 0) {
      addPageWithHeader(document);
    }
  }
};

const addSummaryCard = (document: PDFKit.PDFDocument, x: number, y: number, width: number, label: string, value: string) => {
  document.save();
  document.roundedRect(x, y, width, 58, 8).fillAndStroke(COLORS.panel, COLORS.line);
  document.fillColor(COLORS.muted).font('Helvetica-Bold').fontSize(8)
    .text(label.toUpperCase(), x + 12, y + 10, { width: width - 24 });
  document.fillColor(COLORS.ink).font('Helvetica-Bold').fontSize(16)
    .text(value, x + 12, y + 27, { width: width - 24 });
  document.restore();
  document.x = LEFT;
};

const addWrittenResponses = (document: PDFKit.PDFDocument, responses: WrittenResponse[]) => {
  document.x = LEFT;
  document.moveDown(0.4).font('Helvetica-Bold').fontSize(10).fillColor(COLORS.ink)
    .text(`Written answers (${responses.length})`);

  if (responses.length === 0) {
    ensureSpace(document, 30);
    document.moveDown(0.25).font('Helvetica').fontSize(9).fillColor(COLORS.muted)
      .text('No written answers were submitted for this question.');
    return;
  }

  responses.forEach((response, index) => {
    document.x = LEFT;
    const responseText = response.text.trim() || '(blank response)';
    document.font('Helvetica').fontSize(9);
    const answerHeight = document.heightOfString(responseText, { width: RIGHT - LEFT - 12 });
    const blockHeight = answerHeight + 27;
    const contentBottom = document.page.height - document.page.margins.bottom;
    const fullBodyHeight = contentBottom - CONTENT_TOP;
    ensureSpace(document, blockHeight < fullBodyHeight ? blockHeight : 36);

    document.fillColor(COLORS.green).font('Helvetica-Bold').fontSize(8)
      .text(`ANSWER ${String(index + 1).padStart(2, '0')}`, { continued: true });
    document.fillColor(COLORS.muted).font('Helvetica').fontSize(7)
      .text(`  |  ${response.createdAt.toLocaleString()}`);
    document.moveDown(0.15).fillColor(COLORS.ink).font('Helvetica').fontSize(9);
    document.x = LEFT + 12;
    writeTextAcrossPages(document, responseText, RIGHT - LEFT - 12);
    document.x = LEFT;
    document.moveDown(0.35);
  });
};

const addQuestion = (document: PDFKit.PDFDocument, question: AnalyticsQuestion, index: number, writtenResponses: WrittenResponse[]) => {
  document.x = LEFT;
  document.font('Helvetica-Bold').fontSize(13);
  const titleHeight = document.heightOfString(question.text, { width: RIGHT - LEFT });
  ensureSpace(document, titleHeight + 44);
  document.moveDown(0.85);
  document.fillColor(COLORS.green).font('Helvetica-Bold').fontSize(9)
    .text(`QUESTION ${String(index).padStart(2, '0')}`);
  document.moveDown(0.2).fillColor(COLORS.ink).font('Helvetica-Bold').fontSize(13)
    .text(question.text, { width: RIGHT - LEFT });
  document.moveDown(0.2).fillColor(COLORS.muted).font('Helvetica').fontSize(8)
    .text(`${question.type.replace(/_/g, ' ')}  |  ${question.totalResponses} response${question.totalResponses === 1 ? '' : 's'}`);
  document.moveDown(0.35);

  if (question.type !== 'OPEN_TEXT') {
    for (const response of question.responses) {
      const label = response.optionText ?? response.openText ?? 'Unspecified';
      document.font('Helvetica').fontSize(9);
      const labelHeight = document.heightOfString(label, { width: 330 });
      const rowHeight = Math.max(14, labelHeight) + 20;
      ensureSpace(document, rowHeight + 8);
      const safeRowY = document.y + 3;
      document.fillColor(COLORS.ink).font('Helvetica').fontSize(9)
        .text(label, LEFT + 6, safeRowY, { width: 330 });
      document.font('Helvetica-Bold').fillColor(COLORS.ink).text(`${response.count} responses`, 405, safeRowY, {
        width: RIGHT - 405,
        align: 'right',
      });
      const trackX = LEFT + 6;
      const trackY = safeRowY + Math.max(14, labelHeight) + 4;
      const trackWidth = RIGHT - LEFT - 12;
      const fillWidth = response.count > 0 ? Math.max(2, trackWidth * Math.min(response.percentage, 100) / 100) : 0;
      document.save();
      document.roundedRect(trackX, trackY, trackWidth, 5, 2.5).fill(COLORS.greenTrack);
      if (fillWidth > 0) {
        document.roundedRect(trackX, trackY, fillWidth, 5, 2.5).fill(COLORS.green);
      }
      document.restore();
      document.fillColor(COLORS.muted).font('Helvetica').fontSize(8)
        .text(formatPercentage(response.percentage), RIGHT - 44, trackY + 7, { width: 44, align: 'right' });
      document.y = trackY + 21;
      document.x = LEFT;
      if (response.responseCount) {
        document.fillColor(COLORS.muted).font('Helvetica').fontSize(8)
          .text(`${response.responseCount} custom written response${response.responseCount === 1 ? '' : 's'}`, LEFT + 12)
          .fillColor(COLORS.ink).fontSize(9);
      }
    }
  } else {
    ensureSpace(document, 20);
    document.fillColor(COLORS.muted).font('Helvetica').fontSize(9)
      .text(`${question.openTextResponseCount} written answer${question.openTextResponseCount === 1 ? '' : 's'} recorded.`);
  }

  if (writtenResponses.length > 0) {
    addWrittenResponses(document, writtenResponses);
  }
  document.x = LEFT;
  ensureSpace(document, 8);
  document.moveDown(0.4).strokeColor(COLORS.line).moveTo(LEFT, document.y).lineTo(RIGHT, document.y).stroke();
};

export class ReportService {
  static createPollPdf(report: PollReportData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const { analytics, writtenResponses } = report;
      const document = new PDFDocument({
        size: 'A4',
        margins: { top: CONTENT_TOP, bottom: 64, left: LEFT, right: PAGE_WIDTH - RIGHT },
        bufferPages: true,
        info: {
          Title: `${analytics.pollTitle} - Poll Results Report`,
          Author: 'Pollsmaster',
          Subject: 'Poll results and written responses',
        },
      });
      const chunks: Buffer[] = [];

      document.on('data', (chunk: Buffer) => chunks.push(chunk));
      document.on('error', reject);
      document.on('end', () => resolve(Buffer.concat(chunks)));
      drawHeader(document);

      document.fillColor(COLORS.ink).font('Helvetica-Bold').fontSize(20)
        .text(analytics.pollTitle, { width: RIGHT - LEFT });
      if (analytics.pollDescription) {
        document.moveDown(0.35).fillColor(COLORS.muted).font('Helvetica').fontSize(9)
          .text(analytics.pollDescription, { width: RIGHT - LEFT });
      }

      document.moveDown(0.6).fillColor(COLORS.muted).font('Helvetica').fontSize(8)
        .text(`Generated ${formatDateTime(new Date())}  |  ${analytics.isPublic ? 'Public poll' : 'Private poll'}  |  All recorded results`);
      document.moveDown(0.8);

      const cardGap = 10;
      const cardWidth = (RIGHT - LEFT - cardGap * 2) / 3;
      const cardY = document.y;
      addSummaryCard(document, LEFT, cardY, cardWidth, 'Total votes', String(analytics.totalVotes));
      addSummaryCard(document, LEFT + cardWidth + cardGap, cardY, cardWidth, 'Total responses', String(analytics.totalResponses));
      addSummaryCard(document, LEFT + (cardWidth + cardGap) * 2, cardY, cardWidth, 'Questions', String(analytics.questions.length));
      document.y = cardY + 72;

      if (analytics.lastUpdatedAt) {
        document.x = LEFT;
        document.fillColor(COLORS.muted).font('Helvetica').fontSize(8)
          .text(`Response period: ${analytics.firstResponseAt ? formatDate(analytics.firstResponseAt) : ''} - ${formatDate(analytics.lastUpdatedAt)}`);
      } else {
        document.x = LEFT;
        document.fillColor(COLORS.muted).font('Helvetica').fontSize(8)
          .text('Response period: No responses recorded');
      }

      if (analytics.questions.length >= 6) {
        ensureSpace(document, 24 + analytics.questions.length * 14);
        document.moveDown(0.8).fillColor(COLORS.ink).font('Helvetica-Bold').fontSize(10)
          .text('Questions in this report');
        analytics.questions.forEach((question, index) => {
          document.moveDown(0.25).fillColor(COLORS.muted).font('Helvetica').fontSize(8)
            .text(`${String(index + 1).padStart(2, '0')}. ${question.text}`, { width: RIGHT - LEFT });
        });
        document.moveDown(0.4);
      }

      analytics.questions.forEach((question, index) => {
        addQuestion(
          document,
          question,
          index + 1,
          writtenResponses.filter((response) => response.questionId === question.id),
        );
      });

      const range = document.bufferedPageRange();
      for (let page = range.start; page < range.start + range.count; page += 1) {
        document.switchToPage(page);
        document.page.margins.bottom = 0;
        document.save();
        document.strokeColor(COLORS.line).moveTo(LEFT, PAGE_HEIGHT - 48).lineTo(RIGHT, PAGE_HEIGHT - 48).stroke();
        document.fillColor(COLORS.muted).font('Helvetica').fontSize(8)
          .text(`POLLSMASTER  |  CONFIDENTIAL REPORT  |  PAGE ${page + 1} OF ${range.count}`, LEFT, PAGE_HEIGHT - 37, {
            width: RIGHT - LEFT,
            align: 'center',
            lineBreak: false,
          });
        document.restore();
      }

      document.end();
    });
  }

  static createQuestionnairePdf(poll: Poll): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const document = new PDFDocument({
        size: 'A4',
        margins: { top: CONTENT_TOP, bottom: 64, left: LEFT, right: PAGE_WIDTH - RIGHT },
        bufferPages: true,
        info: {
          Title: `${poll.title} - Questionnaire`,
          Author: 'Pollsmaster',
          Subject: 'Printable poll questionnaire',
        },
      });
      const chunks: Buffer[] = [];
      document.on('data', (chunk: Buffer) => chunks.push(chunk));
      document.on('error', reject);
      document.on('end', () => resolve(Buffer.concat(chunks)));
      drawHeader(document, 'POLL QUESTIONNAIRE', '');

      document.fillColor(COLORS.ink).font('Helvetica-Bold').fontSize(20)
        .text(poll.title, { width: RIGHT - LEFT });
      if (poll.description) {
        document.moveDown(0.35).fillColor(COLORS.muted).font('Helvetica').fontSize(10)
          .text(poll.description, { width: RIGHT - LEFT });
      }
      document.moveDown(0.6).fillColor(COLORS.muted).font('Helvetica').fontSize(8)
        .text(`Created ${formatDate(poll.createdAt)}  |  ${poll.isPublic ? 'Public poll' : 'Private poll'}`);
      document.moveDown(0.5).strokeColor(COLORS.line).moveTo(LEFT, document.y).lineTo(RIGHT, document.y).stroke();

      const addPage = () => {
        document.addPage();
        drawHeader(document, 'POLL QUESTIONNAIRE', '');
      };
      const ensureQuestionnaireSpace = (height: number) => {
        if (document.y + height > document.page.height - document.page.margins.bottom) addPage();
      };

      poll.questions.forEach((question, index) => {
        document.x = LEFT;
        document.font('Helvetica-Bold').fontSize(13);
        const questionHeight = document.heightOfString(question.text, { width: RIGHT - LEFT });
        const answerSpace = question.type === 'OPEN_TEXT' ? 42 : 70;
        ensureQuestionnaireSpace(questionHeight + answerSpace);
        document.moveDown(0.8).fillColor(COLORS.green).font('Helvetica-Bold').fontSize(9)
          .text(`QUESTION ${String(index + 1).padStart(2, '0')}`);
        document.moveDown(0.2).fillColor(COLORS.ink).font('Helvetica-Bold').fontSize(13)
          .text(question.text, { width: RIGHT - LEFT });
        document.moveDown(0.2).fillColor(COLORS.muted).font('Helvetica').fontSize(8)
          .text(question.type === 'OPEN_TEXT' ? 'WRITTEN RESPONSE' : 'SELECT ONE OPTION');
        document.moveDown(0.35);

        if (question.type === 'OPEN_TEXT') {
          ensureQuestionnaireSpace(28);
          const answerLineY = document.y + 20;
          document.strokeColor(COLORS.line).moveTo(LEFT + 8, answerLineY).lineTo(RIGHT, answerLineY).stroke();
          document.y = answerLineY + 8;
        } else if (question.options.length === 0) {
          ensureQuestionnaireSpace(24);
          document.fillColor(COLORS.muted).font('Helvetica').fontSize(9)
            .text('No answer options have been added.', LEFT + 8);
        } else {
          question.options.forEach((option) => {
            document.font('Helvetica').fontSize(10);
            const optionHeight = document.heightOfString(option.text, { width: RIGHT - LEFT - 30 });
            ensureQuestionnaireSpace(Math.max(18, optionHeight) + 12);
            const optionY = document.y + 2;
            document.save();
            document.lineWidth(1).strokeColor(COLORS.muted).rect(LEFT + 8, optionY + 1, 10, 10).stroke();
            document.restore();
            document.fillColor(COLORS.ink).font('Helvetica').fontSize(10)
              .text(option.text, LEFT + 26, optionY, { width: RIGHT - LEFT - 30 });
            if (/^others?(?:\b|$)/i.test(option.text.trim())) {
              const writeInStart = LEFT + 62;
              document.strokeColor(COLORS.line)
                .moveTo(writeInStart, optionY + 13)
                .lineTo(RIGHT, optionY + 13)
                .stroke();
            }
            document.y = optionY + Math.max(18, optionHeight) + 8;
          });
        }

        document.x = LEFT;
        ensureQuestionnaireSpace(14);
        document.moveDown(0.35).strokeColor(COLORS.line).moveTo(LEFT, document.y).lineTo(RIGHT, document.y).stroke();
      });

      const range = document.bufferedPageRange();
      for (let page = range.start; page < range.start + range.count; page += 1) {
        document.switchToPage(page);
        document.page.margins.bottom = 0;
        document.save();
        document.strokeColor(COLORS.line).moveTo(LEFT, PAGE_HEIGHT - 48).lineTo(RIGHT, PAGE_HEIGHT - 48).stroke();
        document.fillColor(COLORS.muted).font('Helvetica').fontSize(8)
          .text(`POLLSMASTER  |  QUESTIONNAIRE  |  PAGE ${page + 1} OF ${range.count}`, LEFT, PAGE_HEIGHT - 37, {
            width: RIGHT - LEFT,
            align: 'center',
            lineBreak: false,
          });
        document.restore();
      }

      document.end();
    });
  }
}
