import os
import logging
import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, File, UploadFile, HTTPException, Header, BackgroundTasks, Depends
from fastapi.middleware.cors import CORSMiddleware
from model import BoneModel
from lung_model import LungModel
from schemas import AnalyzeRequest, CallbackPayload

logger = logging.getLogger("diagnova")

load_dotenv()

INTERNAL_SECRET = os.getenv("INTERNAL_SECRET")

app = FastAPI(title="DIAGNOVA Inference API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

bone_model = BoneModel()
lung_model = LungModel()


def verify_internal_key(x_internal_key: str = Header(...)):
    if not INTERNAL_SECRET:
        raise HTTPException(status_code=500, detail="INTERNAL_SECRET not configured")
    if x_internal_key != INTERNAL_SECRET:
        raise HTTPException(status_code=401, detail="Unauthorized")


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

        case = job.case_type.lower()
        if "lung" in case:
            if not lung_model.is_loaded:
                raise RuntimeError("Lung model not loaded")
            result = lung_model.predict(image_bytes)
        else:
            if not bone_model.is_loaded:
                raise RuntimeError("Bone model not loaded")
            result = bone_model.predict(image_bytes)

        if "findings" in result:
            # lung model: multi-label list
            finding = ", ".join(result["findings"])
        else:
            # bone model: single prediction with confidence
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
    return {
        "status": "ok",
        "message": "DIAGNOVA Inference API running",
        "models": {
            "bone": bone_model.is_loaded,
            "lung": lung_model.is_loaded
        }
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "bone_model_loaded": bone_model.is_loaded,
        "lung_model_loaded": lung_model.is_loaded
    }


@app.post("/analyze", dependencies=[Depends(verify_internal_key)])
async def analyze(job: AnalyzeRequest, background_tasks: BackgroundTasks):
    background_tasks.add_task(run_analysis, job)
    return {"ok": True}


@app.post("/predict/bone")
async def predict_bone(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    if not bone_model.is_loaded:
        raise HTTPException(status_code=503, detail="Bone model not loaded")
    image_bytes = await file.read()
    return bone_model.predict(image_bytes)


@app.post("/predict/lung")
async def predict_lung(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    if not lung_model.is_loaded:
        raise HTTPException(status_code=503, detail="Lung model not loaded")
    image_bytes = await file.read()
    return lung_model.predict(image_bytes)
