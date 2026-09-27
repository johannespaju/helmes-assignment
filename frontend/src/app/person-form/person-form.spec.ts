import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { API_BASE_URL } from '../api/api.config';
import { SectorDto } from '../api/api.models';
import { PersonForm } from './person-form';

describe('PersonForm', () => {
  let component: PersonForm;
  let fixture: ComponentFixture<PersonForm>;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonForm],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(PersonForm);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load sectors from the API', async () => {
    const sectors: SectorDto[] = [
      { id: '1', name: 'Manufacturing', children: [{ id: '2', name: 'Food', children: [] }] },
      { id: '3', name: 'Service', children: [] },
    ];

    httpTesting.expectOne(`${API_BASE_URL}/sectors`).flush(sectors);
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('Food');
    httpTesting.verify();
  });
});
