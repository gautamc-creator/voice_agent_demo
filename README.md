# Voice Agent for Alliance Française de Chicago

A demo of a voice agent using Elasticsearch which can answer visitor questions regarding the website with the help of an Elasticsearch cluster built using a crawler for creating a knowledge base of the website.

## Architecture Overview

- **Elasticsearch Cluster**: Stores indexed website content for semantic search
- **Crawler**: Scrapes and indexes website content into Elasticsearch
- **RAG (Retrieval-Augmented Generation)**: Uses semantic search + LLM for generating answers
- **Voice**: Speech-to-text transcription using OpenAI Whisper
- **FastAPI Backend**: Handles API requests for chat and speech-to-text
- **React Frontend**: Interactive chat widget for website visitors

## Project Structure

```
Voice Agent/
├── backend/           # FastAPI backend (see backend/README.MD)
├── frontend/          # React frontend (see frontend/README.md)
└── www.af-chicago.org/  # Target website files
```

## Quick Start

### 1. Start the Backend

```bash
cd backend
python -m venv .demo
source .demo/bin/activate  # On Windows: .demo\Scripts\activate
pip install -r requirements.txt
# Create .env file with ELASTIC_URL, ELASTIC_API_KEY, OPENAI_API_KEY
uvicorn app.main:app --reload
```

The backend runs on `http://localhost:8000`

See [backend/README.MD](backend/README.MD) for detailed backend setup and API documentation.

### 2. Build and Start the Frontend Widget

For using the widget on the af-chicago.org website, you must build the frontend first (do NOT use `npm run dev` for production):

```bash
cd frontend
npm install
npm run build
npx serve dist -p 3000  # Or your preferred port
```

The frontend widget will be available at `http://localhost:3000`or see the localhost it is running 

See [frontend/README.md](frontend/README.md) for detailed frontend setup and development instructions.

## Widget Integration with www.af-chicago.org

To use the voice agent widget on the www.af-chicago.org website:

### Step 1: Build and serve the frontend

```bash
cd frontend
npm install
npm run build
npx serve dist -p 3000  # Note the port number (3000 in this example)
```

### Step 2: Update the iframe in www.af-chicago.org/index.html

Add/Update the iframe tag in the `<body>` section of `www.af-chicago.org/index.html` and it is at the just before the end tag of `<\body>`:

```html
<iframe src="http://localhost:3000" allow="microphone" style="
    position: fixed;
    bottom: 24px;
    right: 24px;
    width: 500px;
    height: 520px;
    border: none;
    border-radius: 20px;
    box-shadow: 0 20px 40px rgba(218, 0, 46, 0.15), 0 8px 16px rgba(0, 0, 0, 0.1);
    z-index: 9999;
    background-color: #ffffff;
    transition: box-shadow 0.3s ease, transform 0.3s ease;
  "></iframe>
```

**Important**: Replace `http://localhost:3000` with the actual URL where your built frontend is served.

### For Production Deployment

When deploying to production:
1. Update the `src` attribute in the iframe to point to your production frontend URL
2. Ensure the backend API URL is correctly configured in the frontend components
3. Update CORS settings on the backend to allow your production domain

## Development Notes

- Currently configured for the Alliance Française de Chicago website
- Can be expanded to support other domains by indexing their content into Elasticsearch
- The system uses semantic search for better question answering accuracy
- Voice input is optional - users can also type their questions
