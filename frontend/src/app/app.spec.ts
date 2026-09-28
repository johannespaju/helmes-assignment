import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { AdminPage } from './admin-page/admin-page';
import { App } from './app';
import { routes } from './app.routes';
import { SubmissionForm } from './submission-form/submission-form';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter(routes)],
    }).compileComponents();
  });

  it('should render nav links to the form and the admin page', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const links = [...(fixture.nativeElement as HTMLElement).querySelectorAll('nav a')];
    expect(links.map((link) => link.getAttribute('href'))).toEqual(['/', '/admin']);
  });

  it('should show the submission form at the root path', async () => {
    const harness = await RouterTestingHarness.create('/');
    expect(harness.routeDebugElement?.componentInstance).toBeInstanceOf(SubmissionForm);
  });

  it('should show the admin page at /admin', async () => {
    const harness = await RouterTestingHarness.create('/admin');
    expect(harness.routeDebugElement?.componentInstance).toBeInstanceOf(AdminPage);
  });
});
