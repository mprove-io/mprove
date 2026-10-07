import { Injectable } from '@nestjs/common';
import { getExplorerSessionSystemPrompt } from '#backend/services/explorer/explorer-prompts/get-explorer-session-system-prompt/get-explorer-session-system-prompt';
import { getTitleSystemPrompt } from '#backend/services/explorer/explorer-prompts/get-title-system-prompt/get-title-system-prompt';
import type { ExplorerModelPart } from '#backend/services/explorer/types/explorer-model-part';

@Injectable()
export class ExplorerPromptsService {
  getExplorerSessionSystemPrompt(item: {
    orgId: string;
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
    explorerModelParts: ExplorerModelPart[];
    mproveExplorer: string;
  }): string {
    return getExplorerSessionSystemPrompt(item);
  }

  getTitleSystemPrompt(): string {
    return getTitleSystemPrompt();
  }
}
