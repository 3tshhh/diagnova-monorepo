import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Injectable()
export class ChatbotService {
  private readonly logger = new Logger(ChatbotService.name);

  private get fastapiBaseUrl(): string {
    return (
      process.env.FASTAPI_INTERNAL_URL ??
      process.env.FASTAPI_URL ??
      'http://localhost:8000'
    );
  }

  private get internalSecret(): string {
    const secret = process.env.INTERNAL_SECRET;
    if (!secret) {
      throw new InternalServerErrorException('INTERNAL_SECRET not configured');
    }
    return secret;
  }

  async callFastapiChatStream(
    sessionId: string,
    message: string,
  ): Promise<ReadableStream<Uint8Array>> {
    const url = `${this.fastapiBaseUrl}/internal/chat/message`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-key': this.internalSecret,
      },
      body: JSON.stringify({ session_id: sessionId, message }),
    });

    if (!response.ok || !response.body) {
      const text = await response.text().catch(() => '');
      throw new InternalServerErrorException(
        `FastAPI chat stream failed (${response.status}): ${text}`,
      );
    }

    return response.body as ReadableStream<Uint8Array>;
  }

  async streamMessage(
    sessionId: string,
    message: string,
    res: Response,
  ): Promise<void> {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    let stream: ReadableStream<Uint8Array>;
    try {
      stream = await this.callFastapiChatStream(sessionId, message);
    } catch (err) {
      const e = err as Error & { cause?: unknown };
      const causeMsg =
        e.cause && typeof e.cause === 'object'
          ? JSON.stringify(e.cause, Object.getOwnPropertyNames(e.cause))
          : String(e.cause ?? '');
      this.logger.error(
        `Failed to open FastAPI stream for session ${sessionId}: ${e.message} | url=${this.fastapiBaseUrl}/internal/chat/message | cause=${causeMsg}`,
      );
      res.write(
        `data: ${JSON.stringify({
          type: 'error',
          message: 'failed to start stream',
        })}\n\n`,
      );
      res.end();
      return;
    }

    const reader = stream.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        if (value) {
          res.write(decoder.decode(value, { stream: true }));
        }
      }
      const tail = decoder.decode();
      if (tail) res.write(tail);
      res.end();
    } catch (err) {
      this.logger.error(
        `Error while piping FastAPI stream for session ${sessionId}: ${(err as Error).message}`,
      );
      res.write(
        `data: ${JSON.stringify({
          type: 'error',
          message: 'stream failed',
        })}\n\n`,
      );
      res.end();
    } finally {
      try {
        reader.releaseLock();
      } catch {
        /* noop */
      }
    }
  }

  async deleteSession(sessionId: string): Promise<{ ok: true }> {
    const url = `${this.fastapiBaseUrl}/internal/chat/session/${encodeURIComponent(
      sessionId,
    )}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: { 'x-internal-key': this.internalSecret },
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      this.logger.error(
        `FastAPI delete session failed (${response.status}): ${text}`,
      );
      throw new InternalServerErrorException('failed to delete session');
    }

    return { ok: true };
  }
}
