import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, Validators } from '@angular/forms';

import { SectorDto } from '../../api/api.models';
import { SectorSelect } from './sector-select';

describe('SectorSelect', () => {
  let fixture: ComponentFixture<SectorSelect>;
  let control: FormControl<string[]>;

  const sectors: SectorDto[] = [
    {
      id: '1',
      name: 'Manufacturing',
      children: [
        { id: '2', name: 'Food', children: [] },
        { id: '3', name: 'Wood', children: [] },
      ],
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectorSelect],
    }).compileComponents();

    fixture = TestBed.createComponent(SectorSelect);
    control = new FormControl<string[]>([], { nonNullable: true, validators: [Validators.required] });
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('sectors', sectors);
    await fixture.whenStable();
  });

  function getCheckboxes(): HTMLInputElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('input[type="checkbox"]'));
  }

  function getChips(): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.chip'));
  }

  it('should render parents as groups and only leaves as checkboxes', () => {
    const groupSummary: HTMLElement = fixture.nativeElement.querySelector('.panel summary');

    expect(groupSummary.textContent).toContain('Manufacturing');
    expect(getCheckboxes().length).toBe(2);
  });

  it('should write a ticked leaf into the control and show it as a chip', async () => {
    const food = getCheckboxes()[0];
    food.checked = true;
    food.dispatchEvent(new Event('change'));
    await fixture.whenStable();

    expect(control.value).toEqual(['2']);
    expect(getChips().length).toBe(1);
    expect(getChips()[0].textContent).toContain('Food');
  });

  it('should show values set from outside', async () => {
    control.setValue(['2', '3']);
    await fixture.whenStable();

    expect(getChips().length).toBe(2);
    expect(getCheckboxes().every((checkbox) => checkbox.checked)).toBe(true);
    expect(fixture.nativeElement.querySelector('#sectorIds-value').textContent).toContain('2 selected');
    expect(fixture.nativeElement.querySelector('.panel summary').textContent).toContain('(2 selected)');
  });

  it('should remove a sector when its chip is removed', async () => {
    control.setValue(['2', '3']);
    await fixture.whenStable();

    const removeFood: HTMLButtonElement = getChips()[0].querySelector('button')!;
    removeFood.click();
    await fixture.whenStable();

    expect(control.value).toEqual(['3']);
    expect(getChips().length).toBe(1);
  });

  it('should ask for a sector when the last chip is removed', async () => {
    control.setValue(['2']);
    await fixture.whenStable();

    getChips()[0].querySelector('button')!.click();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('#sectorIds-error').textContent).toContain(
      'Select at least one sector.',
    );
  });
});
