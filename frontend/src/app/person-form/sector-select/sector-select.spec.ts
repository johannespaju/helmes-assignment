import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';

import { SectorSelect } from './sector-select';

describe('SectorSelect', () => {
  let component: SectorSelect;
  let fixture: ComponentFixture<SectorSelect>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectorSelect],
    }).compileComponents();

    fixture = TestBed.createComponent(SectorSelect);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('control', new FormControl<string[]>([], { nonNullable: true }));
    fixture.componentRef.setInput('sectors', []);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
