import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { API_BASE_URL } from '../api/api.config';
import { SectorDto, SubmissionDto } from '../api/api.models';
import { AdminPage } from './admin-page';

describe('AdminPage', () => {
  let fixture: ComponentFixture<AdminPage>;
  let httpTesting: HttpTestingController;

  const sectors: SectorDto[] = [
    { id: '1', name: 'Manufacturing', children: [{ id: '2', name: 'Food', children: [] }] },
    { id: '3', name: 'Service', children: [] },
  ];
  const jane: SubmissionDto = {
    id: 'abc',
    name: 'Jane Doe',
    sectorIds: ['2', '3'],
    agreeToTerms: true,
  };

  async function createComponent(): Promise<void> {
    fixture = TestBed.createComponent(AdminPage);
    httpTesting = TestBed.inject(HttpTestingController);
    await fixture.whenStable();
    httpTesting.expectOne(`${API_BASE_URL}/sectors`).flush(sectors);
    await fixture.whenStable();
  }

  function text(): string {
    return fixture.nativeElement.textContent;
  }

  function pickSector(id: string): void {
    const select: HTMLSelectElement = fixture.nativeElement.querySelector('select');
    select.value = id;
    select.dispatchEvent(new Event('change'));
  }

  function cells(): string[] {
    const tds: HTMLElement[] = [...fixture.nativeElement.querySelectorAll('td')];
    return tds.map((td) => td.textContent.trim());
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminPage],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should list every sector as an option, indented by depth', async () => {
    await createComponent();

    const options: HTMLOptionElement[] = [...fixture.nativeElement.querySelectorAll('option')];
    expect(options.map((option) => option.text)).toEqual([
      'Select a sector',
      'Manufacturing',
      '    Food',
      'Service',
    ]);
  });

  it('should ask for a sector before one is picked', async () => {
    await createComponent();

    expect(text()).toContain('Pick a sector to see who selected it.');
  });

  it('should list people in the picked sector with their sector names', async () => {
    await createComponent();

    pickSector('1');
    httpTesting.expectOne(`${API_BASE_URL}/submissions?sectorId=1`).flush([jane]);
    await fixture.whenStable();

    expect(cells()).toEqual(['Jane Doe', 'Food, Service']);
  });

  it('should say when nobody has selected the picked sector', async () => {
    await createComponent();

    pickSector('3');
    httpTesting.expectOne(`${API_BASE_URL}/submissions?sectorId=3`).flush([]);
    await fixture.whenStable();

    expect(text()).toContain('No people have selected this sector.');
  });

  it('should ask for a sector again when the selection is cleared', async () => {
    await createComponent();
    pickSector('1');
    httpTesting.expectOne(`${API_BASE_URL}/submissions?sectorId=1`).flush([jane]);
    await fixture.whenStable();

    pickSector('');
    await fixture.whenStable();

    expect(cells()).toEqual([]);
    expect(text()).toContain('Pick a sector to see who selected it.');
  });

  it('should say when loading people fails', async () => {
    await createComponent();

    pickSector('1');
    httpTesting
      .expectOne(`${API_BASE_URL}/submissions?sectorId=1`)
      .flush(null, { status: 500, statusText: 'Server Error' });
    await fixture.whenStable();

    expect(text()).toContain('Could not load people. Please try again.');
  });

  it('should say when loading sectors fails', async () => {
    fixture = TestBed.createComponent(AdminPage);
    httpTesting = TestBed.inject(HttpTestingController);
    await fixture.whenStable();

    httpTesting
      .expectOne(`${API_BASE_URL}/sectors`)
      .flush(null, { status: 500, statusText: 'Server Error' });
    await fixture.whenStable();

    expect(text()).toContain('Could not load sectors. Please refresh the page.');
  });
});
