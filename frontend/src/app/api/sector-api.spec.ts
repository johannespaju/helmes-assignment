import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { SectorApi } from './sector-api';

describe('SectorApi', () => {
  let service: SectorApi;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(SectorApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
