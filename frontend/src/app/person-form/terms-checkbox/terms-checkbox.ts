import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormControl } from '@angular/forms';

// TODO: "Agree to terms" checkbox bound with [formControl]="control()", plus its validation error.
@Component({
  selector: 'app-terms-checkbox',
  imports: [],
  templateUrl: './terms-checkbox.html',
  styleUrl: './terms-checkbox.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TermsCheckbox {
  control = input.required<FormControl<boolean>>();
}
