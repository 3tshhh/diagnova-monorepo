import json
import logging
from typing import Iterator

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

import chat_session
import gemini_service

logger = logging.getLogger("diagnova.chat")

router = APIRouter(prefix="/internal/chat")


class ChatMessageRequest(BaseModel):
    session_id: str = Field(..., min_length=1)
    message: str = Field(..., min_length=1, max_length=4000)


def _sse(payload: dict) -> str:
    return f"data: {json.dumps(payload)}\n\n"


def _build_stream(session_id: str, message: str) -> Iterator[str]:
    try:
        history = chat_session.get_history(session_id)
        history.append({"role": "user", "parts": [{"text": message}]})

        accumulated = ""
        try:
            for chunk_text in gemini_service.chat_stream(history):
                accumulated += chunk_text
                yield _sse({"type": "chunk", "text": chunk_text})
        except Exception as exc:  # noqa: BLE001
            logger.exception("Gemini stream failed for session %s", session_id)
            yield _sse({"type": "error", "message": str(exc)})
            return

        if accumulated:
            history.append({"role": "model", "parts": [{"text": accumulated}]})
            try:
                chat_session.save_history(session_id, history)
            except Exception as exc:  # noqa: BLE001
                logger.exception(
                    "Failed to persist chat history for session %s", session_id
                )
                yield _sse({"type": "error", "message": "failed to save session"})
                return

        yield _sse({"type": "done"})
    except Exception as exc:  # noqa: BLE001
        logger.exception("Unexpected chat stream error for session %s", session_id)
        yield _sse({"type": "error", "message": str(exc)})


def get_chat_router(verify_internal_key) -> APIRouter:
    @router.post("/message", dependencies=[Depends(verify_internal_key)])
    async def post_message(body: ChatMessageRequest):
        return StreamingResponse(
            _build_stream(body.session_id, body.message),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "X-Accel-Buffering": "no",
            },
        )

    @router.delete(
        "/session/{session_id}",
        dependencies=[Depends(verify_internal_key)],
    )
    async def delete_session(session_id: str):
        try:
            chat_session.delete_session(session_id)
        except Exception as exc:  # noqa: BLE001
            logger.exception("Failed to delete session %s", session_id)
            raise HTTPException(status_code=500, detail="failed to delete session")
        return {"ok": True}

    return router
