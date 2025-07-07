const express = require('express');
const multer = require('multer'); // For file uploads
const path = require('path');
const fs = require('fs');
const { processDocument, readDocument, classifyDocument, translateText } = require('../services/azureServices'); // Adjust the import path as needed

const router = express.Router();

// Set up multer storage (optional, for file storage management)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // specify the folder for storing uploads
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // create a unique filename
    },
});

const upload = multer({ storage: storage }); // Create the upload middleware

// POST route for processing document
router.post('/process', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Get the file path where the document is saved
        const filePath = path.join(__dirname, '../uploads', req.file.filename);

        // Call the document processing function with hardcoded languages (ru -> en)
        await processDocument(filePath, 'ru', 'en');

        // Respond with success message
        res.status(200).json({ message: 'Document processed successfully', filePath: req.file.filename });

    } catch (error) {
        console.error('Error processing document:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/document-info', async (req, res) => {
    try {
        const { filePath } = req.query;

        if (!filePath) {
            return res.status(400).json({ message: 'File path is required' });
        }

        const filePathToProcess = path.join(__dirname, '../uploads', filePath);

        // Ensure the file exists before attempting to process it
        if (!fs.existsSync(filePathToProcess)) {
            return res.status(404).json({ message: 'File not found' });
        }

        // Process the document to extract translated text and document type
        const extractedText = await readDocument(filePathToProcess);
        const classificationResult = await classifyDocument(filePathToProcess);
        const translatedText = await translateText(extractedText, 'ru', 'en'); // Fixed languages

        res.status(200).json({
            translatedText,
            docType: classificationResult, // Document type
        });

    } catch (error) {
        console.error('Error fetching document info:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



module.exports = router;
