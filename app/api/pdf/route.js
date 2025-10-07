import { NextResponse } from "next/server";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// This endpoint has been deprecated in favor of Cloudinary-only flow.
// Upload the PDF to Cloudinary on the client, then call POST /api/pdf/url with the secure_url.
export async function POST() {
  return NextResponse.json(
    {
      error: "Direct PDF upload parsing is disabled",
      details: "Use Cloudinary upload then POST /api/pdf/url with the file URL",
    },
    { status: 410 }
  );
}
