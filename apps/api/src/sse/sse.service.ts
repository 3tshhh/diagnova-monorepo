import { Injectable } from '@nestjs/common';
import { MessageEvent } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class SseService {
  private readonly subjects = new Map<string, Subject<MessageEvent>>();

  getStream(diagnosisId: string): Observable<MessageEvent> {
    if (!this.subjects.has(diagnosisId)) {
      this.subjects.set(diagnosisId, new Subject<MessageEvent>());
    }
    return this.subjects.get(diagnosisId)!.asObservable();
  }

  emit(diagnosisId: string, data: unknown): void {
    const subject = this.subjects.get(diagnosisId);
    if (subject) {
      subject.next({ data } as MessageEvent);
      subject.complete();
      this.subjects.delete(diagnosisId);
    }
  }
}
