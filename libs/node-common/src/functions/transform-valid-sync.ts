import { Logger } from '@nestjs/common';
import {
  ClassType,
  TransformValidationOptions,
  transformAndValidateSync
} from 'class-transformer-validator';
import { BoolEnum } from '~common/enums/bool.enum';
import { ErEnum } from '~common/enums/er.enum';
import { LogLevelEnum } from '~common/enums/log-level.enum';
import { enumToBoolean } from '~common/functions/enum-to-boolean';
import { isDefined } from '~common/functions/is-defined';
import { ServerError } from '~common/models/server-error';
import { getConstraintsRecursive } from './get-constraints-recursive';
import { logToConsole } from './log-to-console';

export function transformValidSync<T extends object>(item: {
  classType: ClassType<T>;
  object: object;
  options?: TransformValidationOptions;
  errorMessage: any;
  logIsJson: BoolEnum;
  logger: Logger;
}) {
  let { classType, object, options, errorMessage, logIsJson, logger } = item;

  let valid: T;
  try {
    valid = transformAndValidateSync(classType, object, options);
  } catch (e) {
    let constraints;

    if (Array.isArray(e)) {
      constraints = getConstraintsRecursive(e);
    }

    let serverError = new ServerError({
      message: errorMessage,
      displayData: constraints,
      originalError: null
    });

    if (
      [
        // default exception handler doesn't print constraints (error data)
        ErEnum.BACKEND_WRONG_ENV_VALUES,
        ErEnum.BLOCKML_WRONG_ENV_VALUES,
        ErEnum.DISK_WRONG_ENV_VALUES
      ].indexOf(errorMessage) > -1
    ) {
      logToConsole({
        log: serverError,
        logIsJson: isDefined(logIsJson) ? enumToBoolean(logIsJson) : false,
        logger: logger,
        logLevel: LogLevelEnum.Error,
        useLoggerOnlyForErrorLevel: false // not need because logLevel is LogLevelEnum.Error
      });
    }

    throw serverError;
  }
  return valid;
}
