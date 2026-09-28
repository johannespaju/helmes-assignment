import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { API_BASE_URL } from '../api/api.config';
import { SubmissionDto, SectorDto } from '../api/api.models';
import { SubmissionForm } from './submission-form';

describe('SubmissionForm', () => {
  let component: SubmissionForm;
  let fixture: ComponentFixture<SubmissionForm>;
  let httpTesting: HttpTestingController;

  const sectors: SectorDto[] = [
    { id: '1', name: 'Manufacturing', children: [{ id: '2', name: 'Food', children: [] }] },
    { id: '3', name: 'Service', children: [] },
  ];
  const submission: SubmissionDto = { id: 'abc', name: 'Jane Doe', sectorIds: ['2'], agreeToTerms: true };

  async function createComponent(): Promise<void> {
    fixture = TestBed.createComponent(SubmissionForm);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
    await fixture.whenStable();
    httpTesting.expectOne(`${API_BASE_URL}/sectors`).flush(sectors);
    await fixture.whenStable();
  }

  function text(): string {
    return fixture.nativeElement.textContent;
  }

  function submit(): void {
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
  }

  beforeEach(async () => {
    sessionStorage.clear();
    await TestBed.configureTestingModule({
      imports: [SubmissionForm],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should create and load sectors from the API', async () => {
    await createComponent();

    expect(component).toBeTruthy();
    expect(text()).toContain('Food');
  });

  it('should fill the form with the submission saved in this session', async () => {
    sessionStorage.setItem('submissionId', 'abc');
    await createComponent();

    httpTesting.expectOne(`${API_BASE_URL}/submissions/abc`).flush(submission);
    await fixture.whenStable();

    const nameInput: HTMLInputElement = fixture.nativeElement.querySelector('#name');
    const termsCheckbox: HTMLInputElement = fixture.nativeElement.querySelector('#agreeToTerms');
    expect(nameInput.value).toBe('Jane Doe');
    expect(termsCheckbox.checked).toBe(true);
    expect(fixture.nativeElement.querySelector('.chip').textContent).toContain('Food');
  });

  it('should show all errors and not save when the form is invalid', async () => {
    await createComponent();

    submit();
    await fixture.whenStable();

    expect(text()).toContain('Name is required.');
    expect(text()).toContain('Select at least one sector.');
    expect(text()).toContain('You must agree to the terms.');
  });

  it('should save a valid form and say so', async () => {
    await createComponent();
    component['form'].setValue({ name: 'Jane Doe', sectorIds: ['2'], agreeToTerms: true });

    submit();
    await fixture.whenStable();
    expect(text()).toContain('Saving…');

    const request = httpTesting.expectOne(`${API_BASE_URL}/submissions`);
    expect(request.request.body).toEqual({ name: 'Jane Doe', sectorIds: ['2'], agreeToTerms: true });
    request.flush(submission);
    await fixture.whenStable();

    expect(text()).toContain('Saved.');
  });

  it('should refill the form with the stored data after saving', async () => {
    await createComponent();
    component['form'].setValue({ name: '  Jane Doe  ', sectorIds: ['2'], agreeToTerms: true });

    submit();
    httpTesting.expectOne(`${API_BASE_URL}/submissions`).flush(submission);
    await fixture.whenStable();

    const nameInput: HTMLInputElement = fixture.nativeElement.querySelector('#name');
    expect(nameInput.value).toBe('Jane Doe');
  });

  it('should say when saving fails', async () => {
    await createComponent();
    component['form'].setValue({ name: 'Jane Doe', sectorIds: ['2'], agreeToTerms: true });

    submit();
    httpTesting
      .expectOne(`${API_BASE_URL}/submissions`)
      .flush(null, { status: 500, statusText: 'Server Error' });
    await fixture.whenStable();

    expect(text()).toContain('Saving failed. Please try again.');
  });
});
