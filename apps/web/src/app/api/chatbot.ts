import { getAccessToken } from './session';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api';

export async function streamChatMessage(
  sessionId: string,
  message: string,
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (msg: string) => void,
): Promise<void> {
  const token = getAccessToken();

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/chatbot/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ sessionId, message }),
    });
  } catch {
    onError('connection_failed');
    return;
  }

  if (!response.ok || !response.body) {
    onError(`request_failed_${response.status}`);
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const payload = line.slice(6).trim();
        if (!payload) continue;
        try {
          const event = JSON.parse(payload) as {
            type: string;
            text?: string;
            message?: string;
          };
          if (event.type === 'chunk' && event.text) onChunk(event.text);
          else if (event.type === 'done') onDone();
          else if (event.type === 'error') onError(event.message ?? 'stream_error');
        } catch {
          /* skip malformed line */
        }
      }
    }
  } finally {
    try {
      reader.releaseLock();
    } catch {
      /* noop */
    }
  }
}

export function deleteChatSession(sessionId: string): void {
  const token = getAccessToken();
  // fire-and-forget — called on component unmount
  void fetch(`${API_BASE_URL}/chatbot/session/${encodeURIComponent(sessionId)}`, {
    method: 'DELETE',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  }).catch(() => {/* noop */});
}
