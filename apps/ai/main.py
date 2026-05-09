import os
import base64
import json
import logging
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Header, Depends, BackgroundTasks, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import httpx
from chat_router import get_chat_router
from schemas import AnalyzeRequest, CallbackPayload

logger = logging.getLogger("diagnova")

load_dotenv()

INTERNAL_SECRET = os.getenv("INTERNAL_SECRET")
HF_TOKEN = os.getenv("HF_TOKEN")
LUNG_SPACE_URL = os.getenv("LUNG_SPACE_URL", "https://etshh-lung.hf.space")
BONE_SPACE_URL = os.getenv("BONE_SPACE_URL", "https://etshh-bone.hf.space")

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


def _hf_headers() -> dict:
    return {"Authorization": f"Bearer {HF_TOKEN}"} if HF_TOKEN else {}


async def call_hf_space(space_url: str, image_bytes: bytes) -> dict:
    image_b64 = base64.b64encode(image_bytes).decode("utf-8")
    headers = _hf_headers()

    async with httpx.AsyncClient(timeout=120) as client:
        # Step 1: submit job → get event_id
        trigger = await client.post(
            f"{space_url}/call/predict",
            json={"data": [f"data:image/jpeg;base64,{image_b64}"]},
            headers=headers,
        )
        trigger.raise_for_status()
        event_id = trigger.json()["event_id"]

        # Step 2: stream SSE until the "complete" event
        event_type = None
        async with client.stream("GET", f"{space_url}/call/predict/{event_id}", headers=headers) as stream:
            async for line in stream.aiter_lines():
                if line.startswith("event: "):
                    event_type = line[7:].strip()
                elif line.startswith("data: "):
                    data_str = line[6:].strip()
                    if event_type == "error":
                        raise RuntimeError(f"HuggingFace Space error: {data_str}")
                    if event_type == "complete" and data_str and data_str != "null":
                        return json.loads(data_str)[0]

    raise RuntimeError("No result received from HuggingFace Space")


async def post_callback(callback_url: str, payload: CallbackPayload):
    async with httpx.AsyncClient(timeout=30) as client:
        await client.post(
            callback_url,
            json=payload.model_dump(exclude_none=True),
            headers={"x-internal-key": INTERNAL_SECRET},
        )


async def run_analysis(job: AnalyzeRequest):
    try:
        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.get(job.image_url)
            resp.raise_for_status()
            image_bytes = resp.content

        space_url = LUNG_SPACE_URL if "lung" in job.case_type.lower() else BONE_SPACE_URL
        result = await call_hf_space(space_url, image_bytes)

        if "findings" in result:
            finding = ", ".join(result["findings"])
        else:
            finding = f"{result['prediction']} ({result['confidence']:.1%} confidence)"

        await post_callback(job.callback_url, CallbackPayload(finding=finding))

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
    return await call_hf_space(LUNG_SPACE_URL, await file.read())


@app.post("/predict/bone", dependencies=[Depends(verify_internal_key)])
async def predict_bone(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    return await call_hf_space(BONE_SPACE_URL, await file.read())
