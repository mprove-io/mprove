import { Injectable } from '@nestjs/common';
import { getExplorerSessionSystemPrompt } from './prompts/explorer-session-system.prompt';
import { getTitleSystemPrompt } from './prompts/title-system.prompt';

@Injectable()
export class ExplorerPromptsService {
  getExplorerSessionSystemPrompt(): string {
    return getExplorerSessionSystemPrompt();
  }

  getTitleSystemPrompt(): string {
    return getTitleSystemPrompt();
  }
}
