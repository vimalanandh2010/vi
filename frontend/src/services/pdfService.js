import * as pdfjsLib from 'pdfjs-dist';

// Set worker source for pdfjs-dist - using a more stable CDN link
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * Extracts raw text from a PDF file via URL
 * @param {string} url - The URL of the PDF resume
 * @returns {Promise<string>} - Extracted text
 */
export const extractTextFromPDF = async (url) => {
    try {
        const loadingTask = pdfjsLib.getDocument(url);
        const pdf = await loadingTask.promise;
        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + '\n';
        }

        return fullText;
    } catch (err) {
        console.error('PDF Extraction Error:', err);
        throw new Error('Failed to extract text from resume. Please ensure the file is accessible.');
    }
};

export default {
    extractTextFromPDF
};
