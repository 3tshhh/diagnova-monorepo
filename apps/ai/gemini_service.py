import os
from typing import Any, Dict, Iterable, List

import google.generativeai as genai

MODEL_NAME = "gemini-2.5-flash"

SYSTEM_PROMPT = (
    "You are DIAGNOVA Assistant, a medical information helper strictly scoped to "
    "lung and bone health topics (e.g. pneumonia, tuberculosis, COVID-19 lung findings, "
    "fractures, osteoporosis, bone tumors, joint conditions).\n\n"
    "Hard rules — never violate:\n"
    "1. You are NOT a doctor. Never give a definitive diagnosis. Never confirm or rule "
    "   out a disease for the user personally.\n"
    "2. Never prescribe, recommend, or suggest specific medications, dosages, or "
    "   treatment plans. Always direct the user to consult a licensed physician.\n"
    "3. Stay strictly on lung and bone topics. If the user asks about anything else "
    "   (cardiology, dermatology, mental health, general chit-chat, coding, politics, "
    "   etc.), politely refuse and redirect them back to lung/bone questions.\n"
    "4. Provide general educational information only — symptoms, risk factors, what a "
    "   condition typically is, what kinds of tests doctors generally use, and "
    "   lifestyle considerations.\n"
    "5. For any urgent symptoms (severe shortness of breath, coughing blood, sudden "
    "   intense chest or bone pain, suspected fracture, etc.), tell the user to seek "
    "   immediate medical care.\n"
    "6. Keep responses concise, clear, and patient-friendly. Avoid heavy jargon."
)


_model: genai.GenerativeModel | None = None


def _get_model() -> genai.GenerativeModel:
    global _model
    if _model is None:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise RuntimeError("GEMINI_API_KEY not configured")
        genai.configure(api_key=api_key)
        _model = genai.GenerativeModel(
            model_name=MODEL_NAME,
            system_instruction=SYSTEM_PROMPT,
        )
    return _model


def validate_history(history: List[Dict[str, Any]]) -> None:
    if not history:
        raise ValueError("history must contain at least one turn")
    expected = "user"
    for i, turn in enumerate(history):
        role = turn.get("role")
        if role not in ("user", "model"):
            raise ValueError(f"history[{i}].role must be 'user' or 'model'")
        if role != expected:
            raise ValueError(
                f"history[{i}].role is '{role}', expected '{expected}' "
                "(history must alternate user/model starting with user)"
            )
        expected = "model" if expected == "user" else "user"


def chat_complete(history: List[Dict[str, Any]]) -> str:
    validate_history(history)
    model = _get_model()
    response = model.generate_content(history)
    return response.text or ""


def chat_stream(history: List[Dict[str, Any]]) -> Iterable[str]:
    validate_history(history)
    model = _get_model()
    stream = model.generate_content(history, stream=True)
    for chunk in stream:
        text = getattr(chunk, "text", None)
        if text:
            yield text
