from pydantic import BaseModel
from typing import List, Dict, Optional

class Top3Item(BaseModel):
    class_name: str = None
    confidence: float

    class Config:
        populate_by_name = True

class PredictionResponse(BaseModel):
    prediction: str
    confidence: float
    top3: List[Dict]
    all_probabilities: Dict[str, float]


class AnalyzeRequest(BaseModel):
    diagnosis_id: str
    case_type: str
    image_url: str
    callback_url: str


class CallbackPayload(BaseModel):
    finding: Optional[str] = None
    error: Optional[str] = None
