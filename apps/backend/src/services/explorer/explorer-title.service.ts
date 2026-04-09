import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { streamText } from 'ai';
import { BackendConfig } from '#backend/config/backend-config';
import { logToConsoleBackend } from '#backend/functions/log-to-console-backend';
import { ErEnum } from '#common/enums/er.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { ServerError } from '#common/models/server-error';
import { ExplorerModelsService } from './explorer-models.service';
import { ExplorerPromptsService } from './explorer-prompts.service';

@Injectable()
export class ExplorerTitleService {
  constructor(
    private explorerModelsService: ExplorerModelsService,
    private explorerPromptsService: ExplorerPromptsService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger
  ) {}

  async generateTitleText(item: {
    sessionId: string;
    provider: string;
    modelId: string;
    apiKey: string;
    userMessage: string;
    useCodex: boolean;
    codexFetch?: typeof fetch;
  }): Promise<string | undefined> {
    let {
      sessionId,
      provider,
      modelId,
      apiKey,
      userMessage,
      useCodex,
      codexFetch
    } = item;

    let model = this.explorerModelsService.getModel({
      provider: provider,
      modelId: modelId,
      apiKey: apiKey,
      useCodex: useCodex,
      codexFetch: codexFetch
    });

    let systemPrompt = this.explorerPromptsService.getTitleSystemPrompt();

    try {
      let result = streamText({
        model: model,
        ...(useCodex
          ? {
              prompt: `Generate a title for this conversation:\n${userMessage}`,
              providerOptions:
                this.explorerModelsService.buildCodexProviderOptions({
                  modelId: modelId,
                  sessionId: sessionId,
                  instructions: systemPrompt,
                  isSmall: true
                })
            }
          : {
              system: systemPrompt,
              prompt: `Generate a title for this conversation:\n${userMessage}`
            })
      });

      let fullText = '';
      for await (let chunk of result.textStream) {
        fullText += chunk;
      }

      let text = fullText.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

      let firstLine = text
        .split('\n')
        .find((line: string) => line.trim().length > 0);

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
          message: ErEnum.BACKEND_PROMPT_FAILED,
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
