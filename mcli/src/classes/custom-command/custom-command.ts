import { Result } from '@praha/byethrow';
import { type BaseContext, Command } from 'clipanion';
import { ServerError } from '#common/classes/server-error/server-error';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import { getConfig } from '#mcli/config/get-config';
import type { McliConfig } from '#mcli/config/mcli-config';
import { logToConsoleMcli } from '#mcli/functions/top/log-to-console-mcli/log-to-console-mcli';
import type { ActError } from '#mcli/types/function-errors/act-error';

type CommandErrorLog = {
  error: {
    code: string;
    details?: unknown;
  };
};

export interface CustomContext extends BaseContext {
  config: McliConfig;
}

export abstract class CustomCommand extends Command<CustomContext> {
  override async execute(): Promise<number> {
    try {
      let result = await Result.pipe(
        Result.succeed({
          config: this.context.config,
          envPath: this.envFilePath
        }),
        Result.andThen(v =>
          isUndefined(v.config)
            ? getConfig({ envPath: v.envPath })
            : Result.succeed(v.config)
        ),
        Result.andThen(async v => {
          this.context.config = v;

          return this.act();
        })
      );

      if (Result.isFailure(result)) {
        let output: CommandErrorLog = {
          error: {
            code: result.error.code
          }
        };

        if ('debug' in this && this.debug === true) {
          output.error.details = result.error;
        }

        logToConsoleMcli({
          log: output,
          logLevel: 'Error',
          context: this.context,
          isJson: 'json' in this && this.json === true
        });

        return 1;
      }

      return 0;
    } catch (error: unknown) {
      let isDebug: boolean = 'debug' in this && this.debug === true;

      let output: CommandErrorLog = {
        error: {
          code:
            error instanceof ServerError ? error.message : 'MCLI_UNKNOWN_ERROR'
        }
      };

      if (isDebug) {
        output.error.details =
          error instanceof Error
            ? {
                message: error.message,
                stack: error.stack,
                displayData:
                  error instanceof ServerError ? error.displayData : undefined
              }
            : error;
      }

      logToConsoleMcli({
        log: output,
        logLevel: 'Error',
        context: this.context,
        isJson: 'json' in this && this.json === true
      });

      return 1;
    }
  }

  abstract act(): Result.ResultAsync<void, ActError>;

  abstract envFilePath?: string;
}
