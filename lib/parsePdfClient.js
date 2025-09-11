'use client';

// Client-side PDF text extraction using pdfjs-dist.
// We disable the worker to avoid cross-origin worker limitations in production.
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';

export async function extractTextFromPdfFile(file) {
  if (!file) throw new Error('No PDF file provided');
  const arrayBuffer = await file.arrayBuffer();
  return extractTextFromPdfBuffer(arrayBuffer);
}

export async function extractTextFromPdfBuffer(arrayBuffer) {
  // Load the PDF document
  const loadingTask = pdfjsLib.getDocument({
    data: arrayBuffer,
    // Disable worker to avoid cross-origin worker requirements
    disableWorker: true,
    // Be conservative to reduce edge-case errors on certain browsers
    isEvalSupported: false,
    verbosity: 0,
  });
  const pdf = await loadingTask.promise;

  let chunks = [];
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const line = textContent.items
      .map((it) => (typeof it.str === 'string' ? it.str : ''))
      .join(' ');
    chunks.push(line);
  }

  const text = chunks
    .join('\n\n')
    .replace(/ +/g, ' ')
    .replace(/\r\n|\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return {
    text,
    pages: pdf.numPages,
  };
}
