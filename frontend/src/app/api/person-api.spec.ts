import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_BASE_URL } from './api.config';
import { PersonDto, PersonInput } from './api.models';
import { PersonApi } from './person-api';

describe('PersonApi', () => {
  let service: PersonApi;
  let httpTesting: HttpTestingController;

  const input: PersonInput = { name: 'Jane Doe', sectorIds: ['2'], agreeToTerms: true };
  const person: PersonDto = { id: 'abc', ...input };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PersonApi);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('get should GET the person by id', () => {
    let result: PersonDto | undefined;

    service.get('abc').subscribe((response) => (result = response));

    const request = httpTesting.expectOne(`${API_BASE_URL}/persons/abc`);
    expect(request.request.method).toBe('GET');
    request.flush(person);

    expect(result).toEqual(person);
  });

  it('create should POST the input without an id', () => {
    let result: PersonDto | undefined;

    service.create(input).subscribe((response) => (result = response));

    const request = httpTesting.expectOne(`${API_BASE_URL}/persons`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(input);
    request.flush(person);

    expect(result).toEqual(person);
  });

  it('update should PUT the person to its id', () => {
    let result: PersonDto | undefined;

    service.update(person).subscribe((response) => (result = response));

    const request = httpTesting.expectOne(`${API_BASE_URL}/persons/abc`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(person);
    request.flush(person);

    expect(result).toEqual(person);
  });
});
