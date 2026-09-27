import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormControl } from '@angular/forms';

// TODO: Name input bound with [formControl]="control()", plus its validation errors.
@Component({
  selector: 'app-person-name',
  imports: [],
  templateUrl: './person-name.html',
  styleUrl: './person-name.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PersonName {
  control = input.required<FormControl<string>>();
}
