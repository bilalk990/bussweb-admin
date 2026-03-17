// Temporary replacement for Puppeteer functionality
// TODO: Implement proper PDF generation when needed

export async function convertHtmlToImage(html: string): Promise<Uint8Array> {
    // Temporary implementation - return empty buffer
    console.log('convertHtmlToImage called - Puppeteer disabled for deployment');
    return new Uint8Array(0);
}

export async function generatePDF(html: string): Promise<Buffer> {
    // Temporary implementation - return empty buffer
    console.log('generatePDF called - Puppeteer disabled for deployment');
    return Buffer.alloc(0);
}