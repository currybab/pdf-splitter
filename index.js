const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');

const splitPDF = async (pdfFilePath, outputDirectory) => {
    if(pdfFilePath[0] !== '/') {
        pdfFilePath = path.join(__dirname, pdfFilePath);
    }
    const paths = pdfFilePath.split('/');
    const fileName = paths[paths.length - 1];
    outputDirectory = path.join(outputDirectory, fileName);
    await fs.promises.mkdir(outputDirectory, { recursive: true })
    const data = await fs.promises.readFile(pdfFilePath);
    const readPdf = await PDFDocument.load(data);
    const { length } = readPdf.getPages();

    for (let i = 0, n = length; i < n; i += 1) {
        const writePdf = await PDFDocument.create();
        const [page] = await writePdf.copyPages(readPdf, [i]);
        writePdf.addPage(page);
        const bytes = await writePdf.save();
        const outputPath = path.join(outputDirectory, `${fileName}_${i + 1}.pdf`);
        await fs.promises.writeFile(outputPath, bytes);
        console.log(`Added ${outputPath}`);
    }
};

const filePath = process.argv[2] || '';
if (filePath.length == 0) console.error('no file path');
splitPDF(filePath, 'outputs').then(() =>
    console.log('Pdf file have been split!')
).catch((e) => {
    console.error(e);
    console.error('faile parse');
});