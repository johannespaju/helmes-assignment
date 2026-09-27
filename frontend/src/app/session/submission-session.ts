import { Injectable, inject } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { SubmissionDto, SubmissionInput } from '../api/api.models';
import { SubmissionApi } from '../api/submission-api';

@Injectable({
  providedIn: 'root',
})
export class SubmissionSession {
  private readonly submissionApi = inject(SubmissionApi);
  private readonly storageKey = 'submissionId';

  load(): Observable<SubmissionDto | null> {
    const id = sessionStorage.getItem(this.storageKey);
    if (id === null) {
      return of(null);
    }
    return this.submissionApi.get(id);
  }

  save(input: SubmissionInput): Observable<SubmissionDto> {
    const id = sessionStorage.getItem(this.storageKey);
    if (id === null) {
      return this.submissionApi
        .create(input)
        .pipe(tap((submission) => sessionStorage.setItem(this.storageKey, submission.id)));
    }
    return this.submissionApi.update({ id, ...input });
  }
}
