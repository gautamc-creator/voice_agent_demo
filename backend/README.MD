# Backend for Voice Agent

This backend is part of a voice agent system that leverages Elasticsearch for semantic search on website data and integrates with Google's Gemini AI for generating responses. It provides APIs for speech-to-text (STT) transcription and chat-based querying, enabling a conversational interface for website-specific questions.

## Features

- **Speech-to-Text (STT)**: Accepts audio files and transcribes them to text (currently using a placeholder; intended for integration with Whisper or Gemini STT).
- **Semantic Search**: Uses Elasticsearch to perform semantic searches on indexed website content.
- **Chat Response Generation**: Generates answers based on retrieved context using Google's Gemini AI model.
- **CORS Support**: Configured for cross-origin requests, suitable for frontend integration.
- **Environment-Based Configuration**: Loads sensitive data (e.g., API keys) from environment variables.

## Prerequisites

- Python 3.10 or higher
- Elasticsearch cluster (configured with semantic search capabilities)
- Google Gemini API key
- Virtual environment (recommended)

## Installation

1. **Clone the Repository** (if applicable) or navigate to the `backend` directory.

2. **Create and Activate a Virtual Environment**:
   ```bash
   python -m venv .demo
   source .demo/bin/activate  # On Windows: .demo\Scripts\activate
   ```

3. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Set Up Environment Variables**:
   Create a `.env` file in the `backend` directory with the following variables:
   ```
   ELASTIC_URL=<your-elasticsearch-url>
   ELASTIC_API_KEY=<your-elasticsearch-api-key>
   GEMINI_API_KEY=<your-google-gemini-api-key>
   ```

## Configuration

- **Elasticsearch Index**: The application expects an index named `websites_semantic_v0` with fields like `title`, `url`, and `body` for semantic search.
- **API Keys**: Ensure `GEMINI_API_KEY` is set for AI responses. The STT endpoint is currently a placeholder and needs integration with an actual STT service.

## Running the Application

1. **Start the Server**:
   ```bash
   uvicorn app.main:app --reload
   ```
   The server will run on `http://localhost:8000` by default.

2. **Access API Documentation**:
   Visit `http://localhost:8000/docs` for interactive Swagger UI documentation of the endpoints.

## API Endpoints

### POST /stt
Transcribes an uploaded audio file to text.

- **Request**: Multipart form data with an audio file (e.g., `file` field).
- **Response**: JSON with `{"text": "<transcribed-text>"}`.
- **Note**: Currently returns placeholder text. Integrate with a real STT service like Google Speech-to-Text or OpenAI Whisper.

### POST /chat
Processes a user query by searching Elasticsearch and generating a response via Gemini AI.

- **Request Body** (JSON):
  ```json
  {
    "query": "Your question here"
  }
  ```
- **Response** (JSON):
  ```json
  {
    "answer": "Generated answer based on context",
    "sources": [
      {
        "title": "Page Title",
        "url": "https://example.com/page"
      }
    ]
  }
  ```
- **Process**:
  1. Performs semantic search on the Elasticsearch index.
  2. Retrieves relevant context from top results.
  3. Uses Gemini AI to generate a response grounded in the context.
  4. Includes source titles and URLs for grounding.

## Development Notes

- **STT Integration**: The `/stt` endpoint is a stub. To implement real transcription, replace the placeholder with calls to an STT API (e.g., using `google-cloud-speech` or OpenAI's Whisper).
- **LLM Integration**: The `/chat` endpoint uses Gemini AI. Ensure the prompt adheres to the system's rules for context-only responses.
- **Error Handling**: Add robust error handling for API failures, invalid inputs, and network issues.
- **Security**: In production, restrict CORS origins, validate inputs, and secure API keys.

## Contributing

- Follow standard Python practices (e.g., PEP 8).
- Add tests for new features.
- Update this README for any changes.

## License

This project is licensed under the MIT License. See the main project README for details.