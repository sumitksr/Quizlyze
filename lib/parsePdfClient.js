'use client';

// Client-side PDF text extraction without bundling pdfjs-dist into Next.js.
// Prefer local dynamic import; if it fails (e.g., bundler issues), fallback to CDN UMD build.
const PDFJS_CDN = 'https://unpkg.com/pdfjs-dist@5.4.149/build/pdf.min.js';
const PDFJS_WORKER_CDN = 'https://unpkg.com/pdfjs-dist@5.4.149/build/pdf.worker.min.js';

let pdfjsLibPromise = null;

async function loadPdfJsFromCdn() {
  if (typeof window === 'undefined') {
    throw new Error('PDF parsing is only available in the browser');
  }

  if (window.pdfjsLib) {
    return window.pdfjsLib;
  }

  if (!pdfjsLibPromise) {
    pdfjsLibPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = PDFJS_CDN;
      script.async = true;
      script.onload = () => {
        if (!window.pdfjsLib) {
          reject(new Error('Failed to load pdfjsLib'));
          return;
        }
        try {
          // Configure worker location (even though we disable it below, this is harmless)
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_CDN;
        } catch {}
        resolve(window.pdfjsLib);
      };
      script.onerror = () => reject(new Error('Failed to load PDF.js from CDN'));
      document.head.appendChild(script);
    });
  }

  return pdfjsLibPromise;
}

async function loadPdfJsPreferLocal() {
  if (typeof window === 'undefined') {
    throw new Error('PDF parsing is only available in the browser');
  }
  // Already loaded via CDN
  if (window.pdfjsLib) return window.pdfjsLib;

  try {
    // Try ESM entry first
    const mod = await import('pdfjs-dist');
    const pdfjsLib = (mod && Object.keys(mod).length ? mod : mod?.default) || mod;
    if (pdfjsLib?.GlobalWorkerOptions) {
      try { pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_CDN; } catch {}
    }
    return pdfjsLib;
  } catch (e1) {
    // Try explicit build path
    try {
      const mod = await import('pdfjs-dist/build/pdf');
      const pdfjsLib = (mod && Object.keys(mod).length ? mod : mod?.default) || mod;
      if (pdfjsLib?.GlobalWorkerOptions) {
        try { pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_CDN; } catch {}
      }
      return pdfjsLib;
    } catch (e2) {
      console.warn('Local pdfjs-dist load failed, falling back to CDN.', e1, e2);
      return loadPdfJsFromCdn();
    }
  }
}

export async function extractTextFromPdfFile(file) {
  if (!file) throw new Error('No PDF file provided');
  const arrayBuffer = await file.arrayBuffer();
  return extractTextFromPdfBuffer(arrayBuffer);
}

export async function extractTextFromPdfBuffer(arrayBuffer) {
  // Ensure pdfjs is loaded
  const pdfjsLib = await loadPdfJsPreferLocal();

  // Load the PDF document (disable worker to avoid cross-origin issues)
  const loadingTask = pdfjsLib.getDocument({
    data: arrayBuffer,
    disableWorker: true,
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
