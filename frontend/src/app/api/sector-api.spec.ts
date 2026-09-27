import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_BASE_URL } from './api.config';
import { SectorDto } from './api.models';
import { SectorApi } from './sector-api';

describe('SectorApi', () => {
  let service: SectorApi;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(SectorApi);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getAll should GET the sector tree', () => {
    const sectors: SectorDto[] = [{ id: '1', name: 'Manufacturing', children: [] }];
    let result: SectorDto[] | undefined;

    service.getAll().subscribe((response) => (result = response));

    const request = httpTesting.expectOne(`${API_BASE_URL}/sectors`);
    expect(request.request.method).toBe('GET');
    request.flush(sectors);

    expect(result).toEqual(sectors);
    httpTesting.verify();
  });
});
