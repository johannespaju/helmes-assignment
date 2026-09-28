import { BrowserContext, Route } from '@playwright/test';

import { API_BASE_URL } from '../src/app/api/api.config';
import { SectorDto, SubmissionDto, SubmissionInput } from '../src/app/api/api.models';

const apiPath = new URL(API_BASE_URL).pathname;

export class FakeApi {
  readonly submissions = new Map<string, SubmissionDto>();

  constructor(readonly sectors: SectorDto[]) {}

  async install(context: BrowserContext): Promise<void> {
    await context.route(`${API_BASE_URL}/**`, (route) => this.handle(route));
  }

  private async handle(route: Route): Promise<void> {
    const request = route.request();
    const url = new URL(request.url());
    const method = request.method();
    const path = url.pathname.substring(apiPath.length);
    const submissionId = path.match(/^\/submissions\/([^/]+)$/)?.[1];

    if (method === 'GET' && path === '/sectors') {
      return route.fulfill({ json: this.sectors });
    }
    if (method === 'POST' && path === '/submissions') {
      return route.fulfill({ status: 201, json: this.store(crypto.randomUUID(), request.postDataJSON()) });
    }
    if (method === 'GET' && submissionId !== undefined) {
      const submission = this.submissions.get(submissionId);
      if (submission === undefined) {
        return route.fulfill({ status: 404 });
      }
      return route.fulfill({ json: submission });
    }
    if (method === 'PUT' && submissionId !== undefined) {
      if (!this.submissions.has(submissionId)) {
        return route.fulfill({ status: 404 });
      }
      return route.fulfill({ json: this.store(submissionId, request.postDataJSON()) });
    }
    return route.fulfill({ status: 501 });
  }

  private store(id: string, input: SubmissionInput): SubmissionDto {
    const submission: SubmissionDto = {
      id,
      name: input.name.trim(),
      sectorIds: input.sectorIds,
      agreeToTerms: input.agreeToTerms,
    };
    this.submissions.set(id, submission);
    return submission;
  }
}
