# FastAPI Integration Contract

What FastAPI must implement to work with the Nest API.

## 1. Accept a diagnosis job from Nest

**Endpoint to expose:** `POST /analyze`

Nest will call this when a new case is created or a diagnosis is rerun.

### Request headers

```
x-internal-key: <INTERNAL_SECRET>
```

Validate this header. Reject requests where it doesn't match.

### Request body

```json
{
  "diagnosis_id": "string",
  "case_type": "string",
  "image_url": "string",
  "callback_url": "string"
}
```

| Field | Description |
|---|---|
| `diagnosis_id` | ID of the diagnosis record in Nest |
| `case_type` | Type of case (e.g. X-ray category) |
| `image_url` | Presigned S3 URL — download the image from here |
| `callback_url` | Full URL to POST results back to when done |

### Response

Nest ignores the response body. Just return `200 OK`.

---

## 2. POST results back to Nest when done

Use the `callback_url` from the job to report results.

### Request headers

```
x-internal-key: <INTERNAL_SECRET>
```

### Request body

```json
{
  "finding": "string (optional)",
  "error": "string (optional)"
}
```

- Send `finding` if analysis succeeded.
- Send `error` if analysis failed.
- At least one should be present.

### What Nest does with this

| Payload | Outcome |
|---|---|
| `finding` present | Diagnosis marked `DONE`, finding stored |
| `finding` absent | Diagnosis marked `FAILED`, error stored |

Nest then emits an SSE event to the frontend.

### Expected response from Nest

```json
{ "ok": true }
```

If you get `401`, your `INTERNAL_SECRET` doesn't match Nest's.

---

## Environment variables

| Variable | Purpose |
|---|---|
| `INTERNAL_SECRET` | Shared secret — must match Nest's value |