import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-terms-checkbox',
  imports: [ReactiveFormsModule],
  templateUrl: './terms-checkbox.html',
  styleUrl: './terms-checkbox.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TermsCheckbox {
  control = input.required<FormControl<boolean>>();
}
