from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel
import httpx
import os

app = FastAPI(title="DiagNova AI Analysis Service")

INTERNAL_SECRET = os.getenv("INTERNAL_SECRET", "")


class AnalyzeRequest(BaseModel):
    diagnosis_id: str
    case_type: str
    image_url: str
    callback_url: str


class DiagnosisResult(BaseModel):
    finding: str | None = None
    error: str | None = None


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/analyze")
async def analyze(
    payload: AnalyzeRequest,
    x_internal_key: str = Header(""),
):
    if INTERNAL_SECRET and x_internal_key != INTERNAL_SECRET:
        raise HTTPException(status_code=403, detail="Invalid internal key")

    # TODO: Replace with actual AI model inference
    # For now, echo back a placeholder finding
    finding = f"Analysis complete for {payload.case_type} (diagnosis {payload.diagnosis_id})"

    # Report result back to NestJS
    async with httpx.AsyncClient() as client:
        try:
            await client.post(
                payload.callback_url,
                json={"finding": finding},
                headers={"x-internal-key": INTERNAL_SECRET},
                timeout=30.0,
            )
        except httpx.HTTPError as exc:
            raise HTTPException(
                status_code=502,
                detail=f"Callback failed: {exc}",
            )

    return {"status": "dispatched", "diagnosis_id": payload.diagnosis_id}
