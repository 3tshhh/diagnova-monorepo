import json
import os
from typing import List, Dict, Any

import redis

SESSION_TTL_SECONDS = 1800
KEY_PREFIX = "chat:session:"

_redis_client: redis.Redis | None = None


def _client() -> redis.Redis:
    global _redis_client
    if _redis_client is None:
        url = os.getenv("REDIS_URL", "redis://localhost:6379")
        _redis_client = redis.from_url(url, decode_responses=True)
    return _redis_client


def _key(session_id: str) -> str:
    return f"{KEY_PREFIX}{session_id}"


def get_history(session_id: str) -> List[Dict[str, Any]]:
    raw = _client().get(_key(session_id))
    if not raw:
        return []
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        return []
    return data if isinstance(data, list) else []


def save_history(session_id: str, history: List[Dict[str, Any]]) -> None:
    _client().set(
        _key(session_id),
        json.dumps(history),
        ex=SESSION_TTL_SECONDS,
    )


def delete_session(session_id: str) -> None:
    _client().delete(_key(session_id))
