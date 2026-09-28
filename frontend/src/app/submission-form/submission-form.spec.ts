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

  function saveButton(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('button[type="submit"]');
  }

  it('should load sectors from the API', async () => {
    await createComponent();

    expect(text()).toContain('Food');
  });

  it('should say when loading sectors fails', async () => {
    fixture = TestBed.createComponent(SubmissionForm);
    httpTesting = TestBed.inject(HttpTestingController);
    await fixture.whenStable();

    httpTesting
      .expectOne(`${API_BASE_URL}/sectors`)
      .flush(null, { status: 500, statusText: 'Server Error' });
    await fixture.whenStable();

    expect(text()).toContain('Could not load sectors. Please refresh the page.');
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

  it('should say when loading the saved submission fails', async () => {
    sessionStorage.setItem('submissionId', 'abc');
    await createComponent();

    httpTesting
      .expectOne(`${API_BASE_URL}/submissions/abc`)
      .flush(null, { status: 500, statusText: 'Server Error' });
    await fixture.whenStable();

    expect(text()).toContain('Could not load your saved data.');
  });

  it.each([
    { problem: 'only whitespace', name: '   ', error: 'Name is required.' },
    { problem: 'over 128 characters', name: 'a'.repeat(129), error: 'Name can be at most 128 characters.' },
  ])('should reject a name that is $problem', async ({ name, error }) => {
    await createComponent();
    const nameInput: HTMLInputElement = fixture.nativeElement.querySelector('#name');
    nameInput.value = name;
    nameInput.dispatchEvent(new Event('input'));

    submit();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('#name-error').textContent).toContain(error);
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
    expect(saveButton().disabled).toBe(true);

    const request = httpTesting.expectOne(`${API_BASE_URL}/submissions`);
    expect(request.request.body).toEqual({ name: 'Jane Doe', sectorIds: ['2'], agreeToTerms: true });
    request.flush(submission);
    await fixture.whenStable();

    expect(text()).toContain('Saved.');
    expect(saveButton().disabled).toBe(false);
  });

  it('should clear the saved message once the form is edited again', async () => {
    await createComponent();
    component['form'].setValue({ name: 'Jane Doe', sectorIds: ['2'], agreeToTerms: true });

    submit();
    httpTesting.expectOne(`${API_BASE_URL}/submissions`).flush(submission);
    await fixture.whenStable();
    expect(text()).toContain('Saved.');

    component['form'].controls.name.setValue('Jane Smith');
    await fixture.whenStable();

    expect(text()).not.toContain('Saved.');
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
