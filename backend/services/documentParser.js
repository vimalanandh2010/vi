const fs = require('fs');
const path = require('path');
const os = require('os');
const { v4: uuidv4 } = require('uuid');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { extractTextFromFile } = require('./geminiScannerService');

/**
 * Downloads a file from a URL using fetch with AbortController for reliable timeouts.
 * @param {string} url - URL to download from
 * @param {number} timeoutMs - Timeout in milliseconds
 * @returns {Promise<Buffer>}
 */
const downloadFileBuffer = async (url, timeoutMs = 10000) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status} when downloading: ${url}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer);
    } catch (err) {
        if (err.name === 'AbortError') {
            throw new Error(`Download timed out after ${timeoutMs}ms: ${url}`);
        }
        throw err;
    } finally {
        clearTimeout(timer);
    }
};

/**
 * Extracts text from a document URL (PDF, DOCX, or Image).
 * @param {string} url - HTTPS URL to the document.
 * @returns {Promise<string>} - Extracted text content.
 */
const extractText = async (url) => {
    let tempFilePath = null;
    try {
        console.log(`[DocumentParser] Downloading file: ${url}`);
        const buffer = await downloadFileBuffer(url);
        console.log(`[DocumentParser] Downloaded ${buffer.length} bytes.`);

        const lowerUrl = url.toLowerCase().split('?')[0]; // strip query params for type detection
        let extractedText = '';

        if (lowerUrl.endsWith('.pdf')) {
            try {
                const result = await pdfParse(buffer);
                extractedText = result.text;
                console.log(`[DocumentParser] pdf-parse extracted ${extractedText.trim().length} chars.`);
            } catch (pdfErr) {
                console.warn(`[DocumentParser] pdf-parse failed (${pdfErr.message}). Will try OCR...`);
                extractedText = '';
            }

            // Detect scanned PDF (if extracted text is too short) → Use Gemini OCR
            if (extractedText.trim().length < 50) {
                console.log('[DocumentParser] Scanned/empty PDF detected. Triggering Gemini OCR...');
                const tempDir = os.tmpdir();
                tempFilePath = path.join(tempDir, `resume_${uuidv4()}.pdf`);
                fs.writeFileSync(tempFilePath, buffer);
                extractedText = await extractTextFromFile(tempFilePath);
                console.log(`[DocumentParser] Gemini OCR extracted ${extractedText?.trim().length || 0} chars.`);
            }
        } else if (lowerUrl.endsWith('.docx')) {
            const result = await mammoth.extractRawText({ buffer });
            extractedText = result.value;
        } else if (lowerUrl.match(/\.(jpg|jpeg|png|webp)$/)) {
            console.log('[DocumentParser] Image resume detected. Triggering Gemini OCR...');
            const ext = path.extname(lowerUrl) || '.jpg';
            const tempDir = os.tmpdir();
            tempFilePath = path.join(tempDir, `resume_${uuidv4()}${ext}`);
            fs.writeFileSync(tempFilePath, buffer);
            extractedText = await extractTextFromFile(tempFilePath);
        } else {
            // Default fallback: try as PDF
            try {
                const result = await pdfParse(buffer);
                extractedText = result.text;
            } catch (e) {
                console.warn('[DocumentParser] Fallback PDF parse failed:', e.message);
            }
        }

        if (!extractedText || extractedText.trim().length === 0) {
            throw new Error('Extracted text is empty after all parsing attempts.');
        }

        console.log(`[DocumentParser] Extraction successful. Text length: ${extractedText.trim().length}`);
        return extractedText;
    } catch (error) {
        console.error('[DocumentParser Error]:', error.message || error);
        throw new Error('Failed to extract text from document: ' + (error.message || 'Unknown error'));
    } finally {
        if (tempFilePath && fs.existsSync(tempFilePath)) {
            try {
                fs.unlinkSync(tempFilePath);
            } catch (e) {
                console.warn('[DocumentParser] Failed to delete temp file:', tempFilePath);
            }
        }
    }
};

module.exports = { extractText };
