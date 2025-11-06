import { NextRequest, NextResponse } from 'next/server';
import { fetchJobDescription } from '@/lib/jd';
import { tailorResumeToJD } from '@/lib/resume';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ error: 'multipart/form-data required' }, { status: 400 });
    }

    const form = await req.formData();
    const url = String(form.get('url') || '');
    const resumeFile = form.get('resume');
    if (!url || !resumeFile || !(resumeFile as any).arrayBuffer) {
      return NextResponse.json({ error: 'url and resume required' }, { status: 400 });
    }

    // Resolve WhatsApp redirect patterns
    const realUrl = extractUrlFromWhatsapp(url) || url;

    const { text: jdText, title } = await fetchJobDescription(realUrl);

    const resumeBuffer = Buffer.from(await (resumeFile as File).arrayBuffer());
    const tailored = await tailorResumeToJD(resumeBuffer, jdText, title);

    const docxBase64 = tailored.updatedDocx.toString('base64');
    const pdfBase64 = tailored.pdf.toString('base64');

    return NextResponse.json({
      summary: tailored.summary,
      jobDescription: jdText,
      docxBase64,
      pdfBase64,
      docxFilename: tailored.docxFilename,
      pdfFilename: tailored.pdfFilename,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Processing failed' }, { status: 500 });
  }
}

function extractUrlFromWhatsapp(u: string): string | null {
  try {
    const url = new URL(u);
    if (url.hostname.includes('whatsapp') && url.searchParams.get('text')) {
      const text = url.searchParams.get('text')!;
      const match = text.match(/https?:\/\/\S+/);
      return match ? match[0] : null;
    }
    // If it's a shortened URL, just return as-is; fetch will follow redirects
    return null;
  } catch {
    return null;
  }
}
