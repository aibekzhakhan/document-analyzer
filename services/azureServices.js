const DocumentIntelligence = require("@azure-rest/ai-document-intelligence").default;
const { getLongRunningPoller, isUnexpected } = require("@azure-rest/ai-document-intelligence");
const { AzureKeyCredential } = require("@azure/core-auth");
const axios = require('axios');
const fs = require('fs');
require('dotenv').config();
const { v4: uuidv4 } = require('uuid');

// Initialize credentials and client
const key = process.env.DOCUMENT_INTELLIGENCE_KEY;
const endpoint = process.env.DOCUMENT_INTELLIGENCE_ENDPOINT;
const client = DocumentIntelligence(endpoint, new AzureKeyCredential(key));

// Function to read text from the document
async function readDocument(filePath) {
    const fileBuffer = fs.readFileSync(filePath);
    const initialResponse = await client
        .path("/documentModels/{modelId}:analyze", "prebuilt-read")
        .post({
            contentType: "application/octet-stream",
            body: fileBuffer,
        });

    if (isUnexpected(initialResponse)) {
        throw initialResponse.body.error;
    }

    const poller = await getLongRunningPoller(client, initialResponse);
    const analyzeResult = (await poller.pollUntilDone()).body.analyzeResult;

    const content = analyzeResult?.content;
    if (!content) {
        throw new Error("Failed to extract text from the document.");
    }
    return content;
}

// Function to classify the document using a custom model
async function classifyDocument(filePath) {
    const fileBuffer = fs.readFileSync(filePath);
    const initialResponse = await client
        .path("/documentClassifiers/{classifierId}:analyze", "prebuild-classify")
        .post({
            contentType: "application/octet-stream",
            body: fileBuffer,
        });

    if (isUnexpected(initialResponse)) {
        throw initialResponse.body.error;
    }

    const poller = await getLongRunningPoller(client, initialResponse);
    const analyzeResult = (await poller.pollUntilDone()).body.analyzeResult;
    const docType = analyzeResult.documents[0].docType;

    if (!analyzeResult) {
        throw new Error("Failed to classify the document.");
    }
    return docType;
}

// Function to translate text using Azure Translator
async function translateText(text, sourceLang = 'ru', targetLang = 'en') {
    try {
        const response = await axios({
            baseURL: "https://api.cognitive.microsofttranslator.com",
            url: '/translate',
            method: 'post',
            headers: {
                'Ocp-Apim-Subscription-Key': process.env.TRANSLATOR_KEY,
                'Ocp-Apim-Subscription-Region': process.env.TRANSLATOR_LOCATION,
                'Content-type': 'application/json',
                'X-ClientTraceId': uuidv4().toString(),
            },
            params: {
                'api-version': '3.0',
                'from': sourceLang,
                'to': targetLang,
            },
            data: [{ text }],
            responseType: 'json',
        });

        return response.data[0].translations[0].text;
    } catch (error) {
        console.error('Error in translation:', error);
    }
}

// Main function to process the document
async function processDocument(filePath, sourceLang = 'ru', targetLang = 'en') {
    try {
        console.log('Step 1: Reading the document...');
        const extractedText = await readDocument(filePath);
        console.log('Extracted Text:', extractedText);

        console.log('Step 2: Classifying the document...');
        const classificationResult = await classifyDocument(filePath);
        console.log('Classification Result:', JSON.stringify(classificationResult, null, 2));

        console.log('Step 3: Translating the document content...');
        const translatedText = await translateText(extractedText, sourceLang, targetLang);
        console.log('Translated Text:', translatedText);
    } catch (error) {
        console.error('Error processing document:', error);
    }
}

module.exports = { processDocument, readDocument, classifyDocument, translateText };
