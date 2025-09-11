import { NextResponse } from "next/server";
import os from "os";
import fs from "fs/promises";
import path from "path";

// Ensure Node.js runtime on Vercel (not Edge)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!file) {
    return NextResponse.json({ error: "No PDF file provided" }, { status: 400 });
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Preferred: parse in-process using pdf-parse (works on Vercel)
    try {
      const pdfParseModule = await import("pdf-parse");
      const pdfParse = pdfParseModule.default || pdfParseModule;
      const pdfData = await pdfParse(buffer);

      const cleanedText = (pdfData.text || "")
      .replace(/ +/g, ' ')
      .replace(/\r\n|\r/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

      return NextResponse.json({
        text: cleanedText,
        metadata: {
          pages: pdfData.numpages,
          info: pdfData.info,
          filename: file.name,
          size: file.size,
        },
      });
    } catch (inProcessError) {
      // Fallback (typically for local dev if bundling acts up):
      // Write to OS temp dir and use helper script, which exists locally.
      const tempDir = os.tmpdir();
      const tempFilePath = path.join(tempDir, `upload_${Date.now()}.pdf`);
      await fs.writeFile(tempFilePath, buffer);

      try {
        const { execFile } = await import("child_process");
        const { promisify } = await import("util");
        const execFileAsync = promisify(execFile);

        const scriptPath = path.join(process.cwd(), 'scripts', 'pdf-parser.js');
        const { stdout, stderr } = await execFileAsync('node', [scriptPath, tempFilePath]);

        if (stderr) {
          // Some libraries print warnings on stderr; don't fail solely on stderr content.
          console.warn("pdf-parser stderr:", stderr);
        }

        const jsonMatch = stdout.match(/{[\s\S]*}/);
        if (!jsonMatch) {
          throw new Error('Could not find valid JSON in the script output.');
        }
        const result = JSON.parse(jsonMatch[0]);

        if (result.error) {
          throw new Error(result.details || result.error);
        }

        const cleanedText = (result.text || "")
          .replace(/ +/g, ' ')
          .replace(/\r\n|\r/g, '\n')
          .replace(/\n{3,}/g, '\n\n')
          .trim();

        return NextResponse.json({
          text: cleanedText,
          metadata: {
            pages: result.numPages,
            info: result.info,
            filename: file.name,
            size: file.size,
          },
        });
      } finally {
        // Clean up the temporary file
        try { await fs.unlink(tempFilePath); } catch {}
      }
    }

  } catch (error) {
    console.error("PDF processing error:", error);
    return NextResponse.json(
      { error: "Failed to process PDF file", details: error.message },
      { status: 500 }
    );
  }
}
