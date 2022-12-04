/* eslint-disable @typescript-eslint/ban-types */
import { Logger } from '@nestjs/common';
import {
  ClassType,
  transformAndValidateSync,
  TransformValidationOptions
} from 'class-transformer-validator';
import { enums } from '~common/barrels/enums';
import { ServerError } from '~common/models/server-error';
import { BoolEnum } from '~common/_index';
import { common } from '~node-common/barrels/common';
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
      data: constraints,
      originalError: null
    });

    if (
      [
        // default exception handler doesn't print constraints (error.data)
        enums.ErEnum.BACKEND_WRONG_ENV_VALUES,
        enums.ErEnum.BLOCKML_WRONG_ENV_VALUES,
        enums.ErEnum.DISK_WRONG_ENV_VALUES
      ].indexOf(errorMessage) > -1
    ) {
      logToConsole({
        log: serverError,
        logIsJson: common.isDefined(logIsJson)
          ? common.enumToBoolean(logIsJson)
          : false,
        logger: logger,
        logLevel: enums.LogLevelEnum.Error
      });
    }

    throw serverError;
  }
  return valid;
}
