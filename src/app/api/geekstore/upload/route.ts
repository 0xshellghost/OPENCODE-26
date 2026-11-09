import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

export const runtime = 'nodejs';

// Maximum upload file size: 10 MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

interface CloudinaryConfig {
  cloudName: string;
  apiKey?: string;
  apiSecret?: string;
  uploadPreset?: string;
}

function getCloudinaryConfig(): CloudinaryConfig | null {
  // 1. Try parsing CLOUDINARY_URL: cloudinary://<api_key>:<api_secret>@<cloud_name>
  const cloudinaryUrl = process.env.CLOUDINARY_URL;
  if (cloudinaryUrl && cloudinaryUrl.startsWith('cloudinary://')) {
    try {
      const match = cloudinaryUrl.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
      if (match) {
        return {
          apiKey: match[1],
          apiSecret: match[2],
          cloudName: match[3],
        };
      }
    } catch {
      // Continue to individual env vars
    }
  }

  // 2. Try individual environment variables
  const cloudName =
    process.env.CLOUDINARY_CLOUD_NAME ||
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  if (!cloudName) return null;

  const apiKey =
    process.env.CLOUDINARY_API_KEY ||
    process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const uploadPreset =
    process.env.CLOUDINARY_UPLOAD_PRESET ||
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  return {
    cloudName,
    apiKey,
    apiSecret,
    uploadPreset,
  };
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = (formData.get('file') || formData.get('image')) as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided in the upload request' },
        { status: 400 },
      );
    }

    // Validate MIME type
    if (!file.type || !file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: `Invalid file type (${file.type}). Only image files (PNG, JPG, WebP, GIF, SVG) are allowed.` },
        { status: 400 },
      );
    }

    // Validate File Size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed size is 10 MB.` },
        { status: 400 },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64DataUri = `data:${file.type};base64,${buffer.toString('base64')}`;

    // -------------------------------------------------------------
    // ATTEMPT 0: Forward to Backend Cloudinary upload endpoint
    // -------------------------------------------------------------
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
    try {
      const backendFormData = new FormData();
      const blob = new Blob([bytes], { type: file.type });
      backendFormData.append('file', blob, file.name);
      backendFormData.append('image', blob, file.name);
      backendFormData.append('folder', 'geekstore');

      const authHeader = req.headers.get('authorization');
      const backendRes = await fetch(`${backendUrl}/api/v1/admin/geekstore/upload`, {
        method: 'POST',
        headers: authHeader ? { Authorization: authHeader } : {},
        body: backendFormData,
      });

      if (backendRes.ok) {
        const backendData = await backendRes.json();
        const payload = backendData.data || backendData;
        const url = payload.url || payload.secure_url;
        if (url) {
          return NextResponse.json({
            success: true,
            url,
            publicId: payload.publicId || payload.public_id,
            provider: 'backend-cloudinary',
          });
        }
      }
    } catch {
      // Backend offline or unreachable, proceed to next option
    }

    // -------------------------------------------------------------
    // ATTEMPT 1: Direct Cloudinary Cloud Upload (if configured in frontend)
    // -------------------------------------------------------------
    const cloudConfig = getCloudinaryConfig();
    if (cloudConfig) {
      try {
        const cloudUploadUrl = `https://api.cloudinary.com/v1_1/${cloudConfig.cloudName}/image/upload`;
        const cloudFormData = new FormData();
        cloudFormData.append('file', base64DataUri);

        if (cloudConfig.uploadPreset) {
          // Unsigned upload preset
          cloudFormData.append('upload_preset', cloudConfig.uploadPreset);
          cloudFormData.append('folder', 'geekstore');
        } else if (cloudConfig.apiKey && cloudConfig.apiSecret) {
          // Signed upload
          const timestamp = Math.floor(Date.now() / 1000).toString();
          const folder = 'geekstore';
          const stringToSign = `folder=${folder}&timestamp=${timestamp}${cloudConfig.apiSecret}`;
          const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');

          cloudFormData.append('api_key', cloudConfig.apiKey);
          cloudFormData.append('timestamp', timestamp);
          cloudFormData.append('folder', folder);
          cloudFormData.append('signature', signature);
        }

        const cloudRes = await fetch(cloudUploadUrl, {
          method: 'POST',
          body: cloudFormData,
        });

        if (cloudRes.ok) {
          const cloudData = await cloudRes.json();
          const secureUrl = cloudData.secure_url || cloudData.url;
          if (secureUrl) {
            return NextResponse.json({
              success: true,
              url: secureUrl,
              publicId: cloudData.public_id,
              provider: 'cloudinary',
              width: cloudData.width,
              height: cloudData.height,
              format: cloudData.format,
            });
          }
        } else {
          const errorJson = await cloudRes.json().catch(() => null);
          console.warn('Cloudinary upload error:', errorJson);
        }
      } catch (cloudErr) {
        console.warn('Failed uploading to Cloudinary, falling back to local storage:', cloudErr);
      }
    }

    // -------------------------------------------------------------
    // ATTEMPT 2: Local File Storage in public/uploads/geekstore/
    // -------------------------------------------------------------
    try {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'geekstore');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Determine extension from MIME or filename
      let extension = 'png';
      if (file.type.includes('jpeg') || file.type.includes('jpg')) extension = 'jpg';
      else if (file.type.includes('webp')) extension = 'webp';
      else if (file.type.includes('gif')) extension = 'gif';
      else if (file.type.includes('svg')) extension = 'svg';
      else if (file.name && file.name.includes('.')) {
        extension = file.name.split('.').pop() || 'png';
      }

      const safeFilename = `product-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${extension}`;
      const targetFilePath = path.join(uploadsDir, safeFilename);

      await fs.promises.writeFile(targetFilePath, new Uint8Array(bytes));

      const publicUrl = `/uploads/geekstore/${safeFilename}`;
      return NextResponse.json({
        success: true,
        url: publicUrl,
        provider: 'local',
        fileName: safeFilename,
      });
    } catch (fsErr) {
      console.warn('Failed saving to public uploads directory, falling back to base64 Data URI:', fsErr);
    }

    // -------------------------------------------------------------
    // ATTEMPT 3: Self-contained Data URI fallback
    // -------------------------------------------------------------
    return NextResponse.json({
      success: true,
      url: base64DataUri,
      provider: 'data-uri',
    });
  } catch (error: any) {
    console.error('Image upload route error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process image upload' },
      { status: 500 },
    );
  }
}
