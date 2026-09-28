import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_BASE_URL } from './api.config';
import { SubmissionDto, SubmissionInput } from './api.models';
import { SubmissionApi } from './submission-api';

describe('SubmissionApi', () => {
  let service: SubmissionApi;
  let httpTesting: HttpTestingController;

  const input: SubmissionInput = { name: 'Jane Doe', sectorIds: ['2'], agreeToTerms: true };
  const submission: SubmissionDto = { id: 'abc', ...input };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(SubmissionApi);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('get should GET the submission by id', () => {
    let result: SubmissionDto | undefined;

    service.get('abc').subscribe((response) => (result = response));

    const request = httpTesting.expectOne(`${API_BASE_URL}/submissions/abc`);
    expect(request.request.method).toBe('GET');
    request.flush(submission);

    expect(result).toEqual(submission);
  });

  it('getBySector should GET submissions filtered by sector id', () => {
    let result: SubmissionDto[] | undefined;

    service.getBySector('2').subscribe((response) => (result = response));

    const request = httpTesting.expectOne(`${API_BASE_URL}/submissions?sectorId=2`);
    expect(request.request.method).toBe('GET');
    request.flush([submission]);

    expect(result).toEqual([submission]);
  });

  it('create should POST the input without an id', () => {
    let result: SubmissionDto | undefined;

    service.create(input).subscribe((response) => (result = response));

    const request = httpTesting.expectOne(`${API_BASE_URL}/submissions`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(input);
    request.flush(submission);

    expect(result).toEqual(submission);
  });

  it('update should PUT the submission to its id', () => {
    let result: SubmissionDto | undefined;

    service.update(submission).subscribe((response) => (result = response));

    const request = httpTesting.expectOne(`${API_BASE_URL}/submissions/abc`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(submission);
    request.flush(submission);

    expect(result).toEqual(submission);
  });
});
