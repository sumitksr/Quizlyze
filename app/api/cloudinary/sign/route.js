import { NextResponse } from "next/server";
import crypto from "crypto";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function signParams(params, apiSecret) {
  // Build the signature string in alphabetical order of keys
  const toSign = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return crypto.createHash("sha1").update(toSign + apiSecret).digest("hex");
}

export async function POST() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json(
      { error: "Cloudinary environment variables are not set" },
      { status: 500 }
    );
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = "quizlyze"; // default folder
  const access_mode = "public"; // ensure assets are publicly accessible

  // Only sign parameters that will be sent to Cloudinary
  const paramsToSign = { access_mode, folder, timestamp };
  const signature = signParams(paramsToSign, apiSecret);

  return NextResponse.json({ timestamp, signature, apiKey, cloudName, folder, accessMode: access_mode });
}
