import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class ChatbotThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    const patientId = req?.loggedInPatient?.patient?.id as string | undefined;
    if (patientId) return `patient:${patientId}`;
    return req?.ip ?? 'unknown';
  }
}
