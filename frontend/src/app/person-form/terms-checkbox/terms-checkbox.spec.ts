import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';

import { TermsCheckbox } from './terms-checkbox';

describe('TermsCheckbox', () => {
  let component: TermsCheckbox;
  let fixture: ComponentFixture<TermsCheckbox>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TermsCheckbox],
    }).compileComponents();

    fixture = TestBed.createComponent(TermsCheckbox);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('control', new FormControl(false, { nonNullable: true }));
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
