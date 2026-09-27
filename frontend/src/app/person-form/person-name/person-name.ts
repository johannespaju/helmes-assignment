import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-person-name',
  imports: [ReactiveFormsModule],
  templateUrl: './person-name.html',
  styleUrl: './person-name.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PersonName {
  control = input.required<FormControl<string>>();
}
