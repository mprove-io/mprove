import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { generateText } from 'ai';
import { BackendConfig } from '#backend/config/backend-config';
import { logToConsoleBackend } from '#backend/functions/log-to-console-backend';
import { ErEnum } from '#common/enums/er.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { ServerError } from '#common/models/server-error';
import { AgentModelsAiService } from '../agent-models-ai.service';
import { AgentAiPromptsService } from './agent-ai-prompts.service';

@Injectable()
export class AgentAiTitleService {
  constructor(
    private agentModelsAiService: AgentModelsAiService,
    private agentAiPromptsService: AgentAiPromptsService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger
  ) {}

  async generateTitleText(item: {
    provider: string;
    modelId: string;
    apiKey: string;
    userMessage: string;
  }): Promise<string | undefined> {
    let { provider, modelId, apiKey, userMessage } = item;

    let model = this.agentModelsAiService.getModel({
      provider: provider,
      modelId: modelId,
      apiKey: apiKey
    });

    let systemPrompt = this.agentAiPromptsService.getTitleSystemPrompt();

    try {
      let result = await generateText({
        model: model,
        system: systemPrompt,
        prompt: `Generate a title for this conversation:\n${userMessage}`
      });

      let text = result.text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

      let firstLine = text.split('\n').find(line => line.trim().length > 0);

      if (!firstLine) {
        return undefined;
      }

      let title = firstLine.trim();

      if (title.length > 100) {
        title = title.slice(0, 97) + '...';
      }

      return title;
    } catch (e) {
      logToConsoleBackend({
        log: new ServerError({
          message: ErEnum.BACKEND_AGENT_PROMPT_FAILED,
          originalError: e
        }),
        logLevel: LogLevelEnum.Info,
        logger: this.logger,
        cs: this.cs
      });
      return undefined;
    }
  }
}
