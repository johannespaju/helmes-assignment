import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_BASE_URL } from '../api/api.config';
import { PersonDto, PersonInput } from '../api/api.models';
import { PersonSession } from './person-session';

describe('PersonSession', () => {
  let service: PersonSession;
  let httpTesting: HttpTestingController;

  const input: PersonInput = { name: 'Jane Doe', sectorIds: ['2'], agreeToTerms: true };
  const person: PersonDto = { id: 'abc', ...input };

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PersonSession);
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

    const request = httpTesting.expectOne(`${API_BASE_URL}/persons`);
    expect(request.request.method).toBe('POST');
    request.flush(person);

    expect(sessionStorage.getItem('personId')).toBe('abc');
  });

  it('save with a remembered id should PUT to that id', () => {
    sessionStorage.setItem('personId', 'abc');

    service.save(input).subscribe();

    const request = httpTesting.expectOne(`${API_BASE_URL}/persons/abc`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(person);
    request.flush(person);
  });

  it('load without a remembered id should return null without a request', () => {
    let result: PersonDto | null | undefined;

    service.load().subscribe((response) => (result = response));

    httpTesting.expectNone(`${API_BASE_URL}/persons/abc`);
    expect(result).toBeNull();
  });

  it('load with a remembered id should GET that person', () => {
    sessionStorage.setItem('personId', 'abc');
    let result: PersonDto | null | undefined;

    service.load().subscribe((response) => (result = response));

    httpTesting.expectOne(`${API_BASE_URL}/persons/abc`).flush(person);
    expect(result).toEqual(person);
  });
});
