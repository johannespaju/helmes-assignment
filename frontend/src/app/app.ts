import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PersonForm } from './person-form/person-form';

@Component({
  selector: 'app-root',
  imports: [PersonForm],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
