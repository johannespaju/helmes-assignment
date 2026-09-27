import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api.config';
import { SubmissionDto, SubmissionInput } from './api.models';

@Injectable({
  providedIn: 'root',
})
export class SubmissionApi {
  private readonly http = inject(HttpClient);

  get(id: string): Observable<SubmissionDto> {
    return this.http.get<SubmissionDto>(`${API_BASE_URL}/submissions/${id}`);
  }

  create(input: SubmissionInput): Observable<SubmissionDto> {
    return this.http.post<SubmissionDto>(`${API_BASE_URL}/submissions`, input);
  }

  update(submission: SubmissionDto): Observable<SubmissionDto> {
    return this.http.put<SubmissionDto>(`${API_BASE_URL}/submissions/${submission.id}`, submission);
  }
}
