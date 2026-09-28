import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_BASE_URL } from '../api/api.config';
import { SubmissionDto, SubmissionInput } from '../api/api.models';
import { SubmissionSession } from './submission-session';

describe('SubmissionSession', () => {
  let service: SubmissionSession;
  let httpTesting: HttpTestingController;

  const input: SubmissionInput = { name: 'Jane Doe', sectorIds: ['2'], agreeToTerms: true };
  const submission: SubmissionDto = { id: 'abc', ...input };

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(SubmissionSession);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('first save should POST and remember the returned id', () => {
    service.save(input).subscribe();

    const request = httpTesting.expectOne(`${API_BASE_URL}/submissions`);
    expect(request.request.method).toBe('POST');
    request.flush(submission);

    expect(sessionStorage.getItem('submissionId')).toBe('abc');
  });

  it('save with a remembered id should PUT to that id', () => {
    sessionStorage.setItem('submissionId', 'abc');

    service.save(input).subscribe();

    const request = httpTesting.expectOne(`${API_BASE_URL}/submissions/abc`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(submission);
    request.flush(submission);
  });

  it('load without a remembered id should return null without a request', () => {
    let result: SubmissionDto | null | undefined;

    service.load().subscribe((response) => (result = response));

    httpTesting.expectNone(`${API_BASE_URL}/submissions/abc`);
    expect(result).toBeNull();
  });

  it('load with a remembered id should GET that submission', () => {
    sessionStorage.setItem('submissionId', 'abc');
    let result: SubmissionDto | null | undefined;

    service.load().subscribe((response) => (result = response));

    httpTesting.expectOne(`${API_BASE_URL}/submissions/abc`).flush(submission);
    expect(result).toEqual(submission);
  });

  it('load should forget a remembered id the API no longer knows', () => {
    sessionStorage.setItem('submissionId', 'abc');
    let result: SubmissionDto | null | undefined;

    service.load().subscribe((response) => (result = response));

    httpTesting
      .expectOne(`${API_BASE_URL}/submissions/abc`)
      .flush(null, { status: 404, statusText: 'Not Found' });
    expect(result).toBeNull();
    expect(sessionStorage.getItem('submissionId')).toBeNull();
  });

  it('load should keep the remembered id when the API fails for another reason', () => {
    sessionStorage.setItem('submissionId', 'abc');
    let failed = false;

    service.load().subscribe({ error: () => (failed = true) });

    httpTesting
      .expectOne(`${API_BASE_URL}/submissions/abc`)
      .flush(null, { status: 500, statusText: 'Server Error' });
    expect(failed).toBe(true);
    expect(sessionStorage.getItem('submissionId')).toBe('abc');
  });
});
