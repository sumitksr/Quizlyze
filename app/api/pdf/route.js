import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

export async function POST(request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!file) {
    return NextResponse.json({ error: "No PDF file provided" }, { status: 400 });
  }

  const tempDir = path.join(process.cwd(), 'tmp');
  await fs.mkdir(tempDir, { recursive: true });
  const tempFilePath = path.join(tempDir, `upload_${Date.now()}.pdf`);

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await fs.writeFile(tempFilePath, buffer);

    const scriptPath = path.join(process.cwd(), 'scripts', 'pdf-parser.js');
    const { stdout, stderr } = await execFileAsync('node', [scriptPath, tempFilePath]);

    if (stderr) {
      throw new Error(`Script error: ${stderr}`);
    }

        // The script might output warnings before the JSON. Find the JSON object in the stdout.
    const jsonMatch = stdout.match(/{[\s\S]*}/);
    if (!jsonMatch) {
      throw new Error('Could not find valid JSON in the script output.');
    }
    const result = JSON.parse(jsonMatch[0]);

    if (result.error) {
      throw new Error(result.details || result.error);
    }

    // Clean up the extracted text while preserving paragraph breaks
    const cleanedText = result.text
      // Replace multiple spaces with a single space, but not newlines
      .replace(/ +/g, ' ')
      // Normalize newline characters
      .replace(/\r\n|\r/g, '\n')
      // Reduce multiple newlines to a maximum of two (for paragraph breaks)
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

  } catch (error) {
    console.error("PDF processing error:", error);
    return NextResponse.json(
      { error: "Failed to process PDF file", details: error.message },
      { status: 500 }
    );
  } finally {
    // Clean up the temporary file
    try {
      await fs.unlink(tempFilePath);
    } catch (cleanupError) {
      console.error("Error deleting temporary file:", cleanupError);
    }
  }
}

