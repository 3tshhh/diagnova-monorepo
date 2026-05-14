import json
import logging
import os
import time
from typing import List, Dict, Any, Tuple

import redis

SESSION_TTL_SECONDS = 1800
KEY_PREFIX = "chat:session:"

logger = logging.getLogger("diagnova.chat_session")

_redis_client: redis.Redis | None = None
_redis_unavailable = False

# value is (serialized_json, expiry_timestamp)
_memory_store: Dict[str, Tuple[str, float]] = {}


def _client() -> redis.Redis | None:
    global _redis_client, _redis_unavailable
    if _redis_unavailable:
        return None
    if _redis_client is None:
        url = os.getenv("REDIS_URL", "redis://localhost:6379")
        _redis_client = redis.from_url(
            url,
            decode_responses=True,
            socket_connect_timeout=3,
            socket_timeout=3,
        )
    return _redis_client


def _key(session_id: str) -> str:
    return f"{KEY_PREFIX}{session_id}"


def get_history(session_id: str) -> List[Dict[str, Any]]:
    global _redis_unavailable
    client = _client()
    if client is not None:
        try:
            raw = client.get(_key(session_id))
        except Exception:
            logger.warning("Redis unavailable, falling back to in-memory store")
            _redis_unavailable = True
            entry = _memory_store.get(_key(session_id))
            raw = entry[0] if entry and entry[1] > time.time() else None
    else:
        entry = _memory_store.get(_key(session_id))
        raw = entry[0] if entry and entry[1] > time.time() else None

    if not raw:
        return []
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        return []
    return data if isinstance(data, list) else []


def save_history(session_id: str, history: List[Dict[str, Any]]) -> None:
    global _redis_unavailable
    serialized = json.dumps(history)
    client = _client()
    if client is not None:
        try:
            client.set(_key(session_id), serialized, ex=SESSION_TTL_SECONDS)
            return
        except Exception:
            logger.warning("Redis unavailable, falling back to in-memory store")
            _redis_unavailable = True
    _memory_store[_key(session_id)] = (serialized, time.time() + SESSION_TTL_SECONDS)


def delete_session(session_id: str) -> None:
    global _redis_unavailable
    client = _client()
    if client is not None:
        try:
            client.delete(_key(session_id))
            return
        except Exception:
            logger.warning("Redis unavailable, falling back to in-memory store")
            _redis_unavailable = True
    _memory_store.pop(_key(session_id), None)  # still works if called explicitly
