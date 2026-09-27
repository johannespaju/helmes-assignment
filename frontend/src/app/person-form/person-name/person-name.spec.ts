import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';

import { PersonName } from './person-name';

describe('PersonName', () => {
  let component: PersonName;
  let fixture: ComponentFixture<PersonName>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonName],
    }).compileComponents();

    fixture = TestBed.createComponent(PersonName);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('control', new FormControl('', { nonNullable: true }));
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
