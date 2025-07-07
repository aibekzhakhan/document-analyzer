# 📄 Azure Document Intelligence & Translation API

This project provides a backend service for processing scanned documents using **Microsoft Azure's AI-powered tools** to:

- 🧠 **Read** and extract content from image/PDF documents  
- 🗂 **Classify** documents using a custom model  
- 🌐 **Translate** Russian-language content to English  
- 📱 Display results in a mobile-friendly frontend (e.g., Flutter)

Built with **Node.js**, **Express.js**, and Azure AI services. Designed for use in mobile apps and enterprise workflows.

---

## ✨ Features

- 📎 Upload document (PDF/image)
- 🔍 Extract text using Azure Form Recognizer / OCR
- 🧾 Automatically classify document types using Azure AI
- 🌍 Translate content from **Russian ➜ English**
- 📤 Return results for display in client apps (e.g., Flutter)

---

## 🔧 Tech Stack

### ⚙ Backend (Node.js + Express)
- Azure SDKs:  
  - `@azure-rest/ai-document-intelligence`  
  - Azure Translator (via `axios`)
- File Uploads: `multer`
- UUID for traceability

### ☁️ Azure Services
- **Form Recognizer / Document Intelligence**  
- **Optical Character Recognition (OCR)**  
- **Azure AI Translator**

---

## 📌 Methodology

1. 📤 **User uploads a scanned document** (PDF or image)
2. 🧾 **Azure Document Intelligence** reads and extracts text (OCR)
3. 🧠 **Custom Classification Model** determines document type
4. 🌍 **Azure Translator** converts Russian text to English
5. 🗃 Extracted and translated data can be **stored in a database** for future use
6. 📱 Results are shown in a **mobile app**

## 🔌 API Overview

This backend API is built with **Node.js** and **Express.js**, exposing endpoints that interact with **Azure AI services** to process uploaded documents.

### What the API Does:
- Accepts **PDF/image uploads** from the frontend
- Sends files to **Azure Document Intelligence** for:
  - Text extraction (OCR)
  - Document classification
- Uses **Azure Translator** to translate extracted content from **Russian to English**
- Sends processed results (translated text + document type) back to the client

### Frontend Integration:
The API is designed to be easily consumed by **any frontend**, including mobile apps (e.g., **Flutter**) or web dashboards.

A typical frontend flow:
1. User uploads a file via form or mobile scan
2. Frontend sends the file to `POST /process`
3. Frontend later calls `GET /document-info` with the file name
4. API returns translated content and classification info to display in the UI

