from fastapi import FastAPI
from app.elastic import es
from app.schemas import ChatRequest

app = FastAPI()

INDEX_NAME = "websites_semantic_v0"


@app.post("/chat")
def chat(req: ChatRequest):
    response = es.search(
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

    results = []

    for hit in response["hits"]["hits"]:
        results.append({
            "id": hit["_id"],
            "title": hit["_source"].get("title"),
            "url": hit["_source"].get("url"),
            "content": hit["_source"].get("body")
        })

    return {
        "query": req.query,
        "results": results
    }
