import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SubmissionForm } from './submission-form/submission-form';

@Component({
  selector: 'app-root',
  imports: [SubmissionForm],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
