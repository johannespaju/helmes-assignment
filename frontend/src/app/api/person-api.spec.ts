import { TestBed } from '@angular/core/testing';

import { PersonApi } from './person-api';

describe('PersonApi', () => {
  let service: PersonApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PersonApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
