import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createWorker } from 'tesseract.js';
import { createCanvas, CanvasRenderingContext2D } from 'canvas';
import path from 'path';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 
  `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

interface RenderContext {
  canvasContext: any;
  viewport: pdfjsLib.PageViewport;
}

async function renderPageToImage(pdfDoc: pdfjsLib.PDFDocumentProxy, pageNum: number): Promise<Buffer> {
  try {
    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: 2.0 });

    const canvas = createCanvas(viewport.width, viewport.height);
    const context = canvas.getContext('2d');

    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, viewport.width, viewport.height);

    const renderContext: RenderContext = {
      canvasContext: context as any,
      viewport: viewport,
    };

    await page.render(renderContext).promise;
    return canvas.toBuffer('image/png');
  } catch (error) {
    console.error('Error rendering page:', error);
    throw error;
  }
}

// Updated to accept Uint8Array
async function extractTextFromPDF(data: Uint8Array): Promise<string> {
  try {
    const loadingTask = pdfjsLib.getDocument({
      data: data,
      useSystemFonts: true,
      disableFontFace: true,
      cMapUrl: path.join(process.cwd(), 'node_modules', 'pdfjs-dist', 'cmaps/'),
      cMapPacked: true,
    });

    const pdfDoc = await loadingTask.promise;
    const numPages = pdfDoc.numPages;

    console.log(`Processing PDF with ${numPages} pages`);

    // Use the core version for Node.js compatibility
    const { createWorker } = require('@tesseract.js/core');
    
    const worker = await createWorker({
      workerPath: path.join(process.cwd(), 'node_modules', '@tesseract.js', 'core', 'dist', 'worker.min.js'),
      langPath: path.join(process.cwd(), 'public', 'tessdata'), // Create this directory
      corePath: path.join(process.cwd(), 'node_modules', '@tesseract.js', 'core', 'dist', 'tesseract-core.wasm.js'),
      logger: (m: unknown) => console.log(m),
    });

    await worker.loadLanguage('eng');
    await worker.initialize('eng');

    let fullText = '';

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      console.log(`Processing page ${pageNum}/${numPages}`);
      const pageImage = await renderPageToImage(pdfDoc, pageNum);
      const { data: { text } } = await worker.recognize(pageImage);
      fullText += text + '\n\n';
    }

    await worker.terminate();
    return fullText.trim();
  } catch (error) {
    console.error('Error in OCR processing:', error);
    if (error instanceof Error) {
      throw new Error(`OCR processing failed: ${error.message}`);
    }
    throw new Error('OCR processing failed due to an unknown error');
  }
}

function splitIntoChunks(text: string, maxChunkSize: number = 8000): string[] {
  const chunks: string[] = [];
  let currentChunk = '';
  const sentences = text.split(/(?:\. |\n)/);

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxChunkSize && currentChunk) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += (currentChunk ? ' ' : '') + sentence;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

async function processChunksSequentially(chunks: string[]): Promise<string[]> {
  const results: string[] = [];

  for (let i = 0; i < chunks.length; i++) {
    try {
      if (!chunks[i].trim()) continue;

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Extract and summarize the key concepts, definitions, and important information from this text. Focus on content that would be valuable for creating flashcards. Be thorough but concise."
          },
          {
            role: "user",
            content: chunks[i]
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });

      const result = completion.choices[0].message.content;
      if (result) {
        results.push(result);
      }

      if (i < chunks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`Error processing chunk ${i + 1}:`, error);
      throw error;
    }
  }

  return results;
}

interface Flashcard {
  question: string;
  answer: string;
}

interface FlashcardsResponse {
  flashcards: Flashcard[];
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const pdfFile = formData.get('pdf') as File;

    if (!pdfFile) {
      return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 });
    }

    console.log('Processing PDF:', pdfFile.name);
    const uint8Array = new Uint8Array(await pdfFile.arrayBuffer());
    const extractedText = await extractTextFromPDF(uint8Array);

    console.log('OCR text extraction complete, length:', extractedText.length);

    if (!extractedText || extractedText.trim().length < 50) {
      return NextResponse.json({ error: 'Could not extract meaningful text from the PDF' }, { status: 400 });
    }

    const chunks = splitIntoChunks(extractedText);
    const processedChunks = await processChunksSequentially(chunks);
    const combinedContent = processedChunks.join('\n\n');

    const flashcardCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Create 10 high-quality flashcards from the provided content. Each flashcard should have a clear question and comprehensive answer. Format the output exactly as a JSON object with the structure: {\"flashcards\": [{\"question\": \"string\", \"answer\": \"string\"}]}"
        },
        {
          role: "user",
          content: combinedContent
        }
      ],
      response_format: { type: "json_object" }
    });

    const flashcardsContent = flashcardCompletion.choices[0].message.content;

    if (!flashcardsContent) {
      return NextResponse.json({ error: 'Failed to generate flashcards' }, { status: 500 });
    }

    try {
      const flashcards = JSON.parse(flashcardsContent) as FlashcardsResponse;
      return NextResponse.json({
        text: combinedContent,
        flashcards: flashcards.flashcards || []
      });
    } catch (parseError) {
      console.error('Error parsing flashcards JSON:', parseError);
      return NextResponse.json({ error: 'Failed to parse generated flashcards' }, { status: 500 });
    }
  } catch (error) {
    console.error('Request processing error:', error);
    const message = error instanceof Error ? error.message : 'Failed to process PDF';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}