// Upload a PDF file directly from the browser to Cloudinary (resource_type=raw)
// Requires server route at /api/cloudinary/sign which returns { timestamp, signature, apiKey, cloudName, folder }

export async function uploadPdfToCloudinary(file) {
  if (!file) throw new Error('No file to upload');

  // 1) Ask server to sign the upload params
  const signRes = await fetch('/api/cloudinary/sign', { method: 'POST' });
  if (!signRes.ok) {
    const details = await signRes.json().catch(() => ({}));
    throw new Error(details.error || 'Failed to get Cloudinary signature');
  }
  const { timestamp, signature, apiKey, cloudName, folder, accessMode } = await signRes.json();

  // 2) Upload to Cloudinary directly from the browser
  const form = new FormData();
  form.append('file', file);
  form.append('api_key', apiKey);
  form.append('timestamp', String(timestamp));
  form.append('signature', signature);
  form.append('folder', folder);
  if (accessMode) {
    form.append('access_mode', accessMode);
  }
  // Keep only signed params to avoid signature mismatch

  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`;
  const upRes = await fetch(uploadUrl, { method: 'POST', body: form });
  if (!upRes.ok) {
    const err = await upRes.json().catch(() => ({}));
    const msg = err.error?.message || 'Cloudinary upload failed';
    throw new Error(msg);
  }
  const payload = await upRes.json();
  return { url: payload.secure_url, publicId: payload.public_id };
}
