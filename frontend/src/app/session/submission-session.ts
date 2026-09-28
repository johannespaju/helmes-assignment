import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, of, tap, throwError } from 'rxjs';
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
    return this.submissionApi.get(id).pipe(
      catchError((error: unknown) => {
        if (error instanceof HttpErrorResponse && error.status === 404) {
          sessionStorage.removeItem(this.storageKey);
          return of(null);
        }
        return throwError(() => error);
      }),
    );
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
