import { Logger } from '@nestjs/common';
import { z } from 'zod';
import { ErEnum } from '#common/enums/er.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { isDefined } from '#common/functions/is-defined';
import { ServerError } from '#common/models/server-error';
import { logToConsole } from './log-to-console';

export function zodParseOrThrow<T extends z.ZodType>(item: {
  schema: T;
  object: unknown;
  errorMessage: any;
  logIsJson: boolean;
  logger: Logger;
}): z.infer<T> {
  let { schema, object, errorMessage, logIsJson, logger } = item;

  let result = schema.safeParse(object);

  if (result.success) {
    return result.data;
  }

  let constraints = result.error.issues.map(issue => ({
    path: issue.path.join('.'),
    message: issue.message,
    code: issue.code
  }));

  let serverError = new ServerError({
    message: errorMessage,
    displayData: constraints,
    originalError: result.error
  });

  if (
    [
      ErEnum.BACKEND_WRONG_ENV_VALUES,
      ErEnum.BLOCKML_WRONG_ENV_VALUES,
      ErEnum.DISK_WRONG_ENV_VALUES
    ].indexOf(errorMessage) > -1
  ) {
    logToConsole({
      log: serverError,
      logIsJson: isDefined(logIsJson) ? logIsJson : false,
      logger: logger,
      logLevel: LogLevelEnum.Error,
      useLoggerOnlyForErrorLevel: false
    });
  }

  throw serverError;
}
