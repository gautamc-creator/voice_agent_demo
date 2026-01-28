from openai import OpenAI
# from google import genai
from fastapi import FastAPI,UploadFile,HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.elastic import es
from app.schemas import ChatRequest
import os
from dotenv import load_dotenv
# from app.gemini_client import client
from google.genai.types import GenerateContentConfig
from google import genai
import io



load_dotenv()

os.environ["OPENAI_API_KEY"] = os.getenv("OPENAI_API_KEY")
# genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
# client = genai.Client()

client = OpenAI()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

INDEX_NAME = "websites_semantic_v0"

@app.post("/stt")
async def speech_to_text(file: UploadFile):
    """
    Accepts an audio file (webm/wav/mp3),
    sends it to Whisper,
    returns transcribed text.
    """

    if file is None:
        raise HTTPException(status_code=400, detail="Audio file is required")

    try:
        # Read audio bytes
        audio_bytes = await file.read()

        if not audio_bytes:
            raise HTTPException(status_code=400, detail="Empty audio file")

        # Whisper requires file-like object with name
        audio_buffer = io.BytesIO(audio_bytes)
        audio_buffer.name = file.filename or "audio.webm"

        # Call Whisper
        transcription = client.audio.transcriptions.create(
            model="whisper-1",
            file=audio_buffer,
            response_format="text"  # returns plain string
        )

        return JSONResponse(
            content={"text": transcription},
            status_code=200
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"STT failed: {str(e)}"
        )

@app.post("/chat")
def chat(req: ChatRequest):
    # 1. Semantic search
    search_response = es.search(
        index=INDEX_NAME,
        size=5,
        _source=["title", "url", "body"],
        query={
            "semantic": {
                "field": "body",
                "query": req.query
            }
        }
    )
    
    #  # Debug: Check what's returned
    # print(f"Search response: {search_response}")
    
    print(f"Search response hits count: {len(search_response['hits']['hits'])}")

    if not search_response["hits"]["hits"]:
        return {
            "answer": "I couldn't find this information on the website.",
            "sources": []
        }

    # 2. Collect chunk IDs
    doc_ids = [hit["_id"] for hit in search_response["hits"]["hits"]]
    print(f"Doc IDs: {doc_ids}")
    
    
    # 3. ESQL grounding (title + url)
    esql_query = f"""
    FROM {INDEX_NAME} METADATA _id
    | WHERE _id IN ({",".join([f'"{id}"' for id in doc_ids])})
    | KEEP title, url
    """

    try:
        esql_response = es.esql.query(query=esql_query)
        print(f"ESQL response: {esql_response}")
    except Exception as e:
        print(f"ESQL error: {e}")
        esql_response = {"values": []}

    sources = []
    for row in esql_response.get("values", []):
        if len(row) >= 2:
            sources.append({
                "title": row[0],
                "url": row[1]
            })

    # 4. Build context for LLM
    context_blocks = []
    for hit in search_response["hits"]["hits"]:
        context_blocks.append(hit["_source"]["body"])

    context_text = "\n\n".join(context_blocks)
    print(f"Context length: {len(context_text)}")

    
 
    # 5. Call LLM

    # SYSTEM_PROMPT = """
    #     You are a website-specific assistant.
    #     Rules:
    #     - Answer ONLY using provided context.
    #     - Do NOT use outside knowledge.
    #     - If not found in context, say "I couldn't find this information on the website."
    # """
    
    SYSTEM_PROMPT = """You are a helpful website assistant for Alliance Française de Chicago.
        Your job is to answer user questions using ONLY the provided website content.
        Be concise and helpful. If the answer is in the context, extract and summarize it.
        Include relevant source URLs in markdown.
        If you truly cannot find the answer in the context, say 'I couldn't find this information on the website.'"""
    
    
    completion = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": f"""
                        Context:
                        {context_text}

                        Question:
                        {req.query}
                        """
            }
        ],
        temperature=0
    )

    answer = completion.choices[0].message.content
    
    
    
    # full_prompt = f"""
    #     Context:
    #     {context_text}

    #     Question:
    #     {req.query}
    #     """
        
    # response = client.models.generate_content(
    #     model="gemini-2.0-flash",
    #     contents=full_prompt,
    #     config=GenerateContentConfig(
    #         system_instruction=SYSTEM_INSTRUCTION,
    #         max_output_tokens=512,
    #         temperature=0.0
    #     )
    # )

    # answer_text = response.text
    # answer_text = "Hi"
     
    return {
        "answer": answer,
        "sources": sources
    }
