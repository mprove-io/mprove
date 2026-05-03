import { Injectable } from '@nestjs/common';
import { getExplorerSessionSystemPrompt } from './prompts/explorer-session-system.prompt';
import { getTitleSystemPrompt } from './prompts/title-system.prompt';

@Injectable()
export class ExplorerPromptsService {
  getExplorerSessionSystemPrompt(item?: {
    orgId: string;
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
  }): string {
    return getExplorerSessionSystemPrompt(item);
  }

  getTitleSystemPrompt(): string {
    return getTitleSystemPrompt();
  }
}
