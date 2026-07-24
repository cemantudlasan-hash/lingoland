import { NextResponse } from 'next/server';
import mammoth from 'mammoth';
const pdf = require('pdf-parse');

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    const fileType = file.name.split('.').pop()?.toLowerCase();
    const buffer = Buffer.from(await file.arrayBuffer());

    let text = '';

    if (fileType === 'pdf') {
      const pdfData = await pdf(buffer);
      text = pdfData.text;
    } else if (fileType === 'docx') {
      const docxData = await mammoth.extractRawText({ buffer });
      text = docxData.value;
    } else if (fileType === 'txt' || fileType === 'md') {
      text = buffer.toString('utf-8');
    } else {
      return NextResponse.json({ success: false, error: 'Unsupported file type. Please upload a PDF, DOCX, TXT, or MD file.' }, { status: 400 });
    }

    // Clean up empty lines or double spaces to save token space
    const cleanedText = text
      .replace(/\r\n/g, '\n')
      .replace(/\n\s*\n+/g, '\n\n')
      .trim();

    return NextResponse.json({ success: true, text: cleanedText });
  } catch (error: any) {
    console.error('Error parsing document:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to parse document' }, { status: 500 });
  }
}
