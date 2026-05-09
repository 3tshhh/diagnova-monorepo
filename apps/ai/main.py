import asyncio
import logging
import os
import tempfile
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Header, Depends, BackgroundTasks, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from gradio_client import Client, handle_file
import httpx
from chat_router import get_chat_router
from schemas import AnalyzeRequest, CallbackPayload

logger = logging.getLogger("diagnova")

load_dotenv()

INTERNAL_SECRET = os.getenv("INTERNAL_SECRET")
HF_TOKEN = os.getenv("HF_TOKEN") or None
LUNG_SPACE = os.getenv("LUNG_SPACE", "etshh/lung")
BONE_SPACE = os.getenv("BONE_SPACE", "etshh/bone")

app = FastAPI(title="DIAGNOVA Inference API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def verify_internal_key(x_internal_key: str = Header(...)):
    if not INTERNAL_SECRET:
        raise HTTPException(status_code=500, detail="INTERNAL_SECRET not configured")
    if x_internal_key != INTERNAL_SECRET:
        raise HTTPException(status_code=401, detail="Unauthorized")


app.include_router(get_chat_router(verify_internal_key))


def _predict_from_url(space: str, image_url: str) -> dict:
    client = Client(space, hf_token=HF_TOKEN)
    return client.predict(image=handle_file(image_url), api_name="/predict")


def _predict_from_bytes(space: str, image_bytes: bytes) -> dict:
    with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp:
        tmp.write(image_bytes)
        tmp_path = tmp.name
    try:
        client = Client(space, hf_token=HF_TOKEN)
        return client.predict(image=handle_file(tmp_path), api_name="/predict")
    finally:
        os.unlink(tmp_path)


def _format_result(result) -> str:
    if isinstance(result, dict):
        if "findings" in result:
            return ", ".join(result["findings"])
        if "prediction" in result:
            return f"{result['prediction']} ({result['confidence']:.1%} confidence)"
    return str(result)


async def post_callback(callback_url: str, payload: CallbackPayload):
    async with httpx.AsyncClient(timeout=30) as client:
        await client.post(
            callback_url,
            json=payload.model_dump(exclude_none=True),
            headers={"x-internal-key": INTERNAL_SECRET},
        )


async def run_analysis(job: AnalyzeRequest):
    try:
        space = LUNG_SPACE if "lung" in job.case_type.lower() else BONE_SPACE
        result = await asyncio.to_thread(_predict_from_url, space, job.image_url)
        await post_callback(job.callback_url, CallbackPayload(finding=_format_result(result)))
    except Exception as exc:
        logger.error("Analysis failed for %s: %s", job.diagnosis_id, exc)
        try:
            await post_callback(job.callback_url, CallbackPayload(error=str(exc)))
        except Exception as cb_exc:
            logger.error("Callback also failed for %s: %s", job.diagnosis_id, cb_exc)


@app.get("/")
def root():
    return {"status": "ok", "message": "DIAGNOVA AI API running", "version": "2.0.0"}


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.post("/analyze", dependencies=[Depends(verify_internal_key)])
async def analyze(job: AnalyzeRequest, background_tasks: BackgroundTasks):
    background_tasks.add_task(run_analysis, job)
    return {"ok": True}


@app.post("/predict/lung", dependencies=[Depends(verify_internal_key)])
async def predict_lung(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    return await asyncio.to_thread(_predict_from_bytes, LUNG_SPACE, await file.read())


@app.post("/predict/bone", dependencies=[Depends(verify_internal_key)])
async def predict_bone(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    return await asyncio.to_thread(_predict_from_bytes, BONE_SPACE, await file.read())
