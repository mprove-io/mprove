import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import type { StructTab } from '#backend/drizzle/postgres/tables/structs';
import { structsTable } from '#backend/drizzle/postgres/tables/structs';
import type { DbService } from '#backend/services/db/db.service';
import {
  EMPTY_STRUCT_ID,
  PROJECT_CONFIG_CURRENCY_PREFIX,
  PROJECT_CONFIG_CURRENCY_SUFFIX,
  PROJECT_CONFIG_DEFAULT_TIMEZONE,
  PROJECT_CONFIG_FORMAT_NUMBER,
  PROJECT_CONFIG_THOUSANDS_SEPARATOR
} from '#common/constants/top';
import type { GetStructCheckExistsError } from '#common/types/backend/function-errors/get-struct-check-exists-error';

export async function getStructCheckExists(item: {
  structId: string;
  projectId: string;
  isGetEmptyStructOnError?: boolean;
  cs: ConfigService<BackendConfig>;
  db: DbService;
}): Result.ResultAsync<StructTab, GetStructCheckExistsError> {
  let { structId, projectId, isGetEmptyStructOnError, cs, db } = item;

  let emptyStruct: StructTab = {
    structId: structId,
    projectId: projectId,
    errors: [],
    modelFilePaths: [],
    metrics: [],
    presets: [],
    spaces: [],
    extraSchemas: [],
    mproveConfig: {
      mproveDirValue: './data',
      weekStart: 'Sunday',
      allowTimezones: true,
      caseSensitiveStringFilters: false,
      defaultTimezone: PROJECT_CONFIG_DEFAULT_TIMEZONE,
      formatNumber: PROJECT_CONFIG_FORMAT_NUMBER,
      currencyPrefix: PROJECT_CONFIG_CURRENCY_PREFIX,
      currencySuffix: PROJECT_CONFIG_CURRENCY_SUFFIX,
      thousandsSeparator: PROJECT_CONFIG_THOUSANDS_SEPARATOR
    },
    mproveExplorer: undefined,
    mproveVersion:
      cs.get<BackendConfig['mproveReleaseTag']>('mproveReleaseTag'),
    keyTag: undefined,
    serverTs: undefined
  };

  if (structId === EMPTY_STRUCT_ID) {
    return Result.succeed(emptyStruct);
  }

  return db.structs
    .findFirstCheckExists({
      where: and(
        eq(structsTable.structId, structId),
        eq(structsTable.projectId, projectId)
      )
    })
    .then(structResult =>
      Result.isFailure(structResult) &&
      structResult.error.code === 'BACKEND_STRUCT_DOES_NOT_EXIST' &&
      isGetEmptyStructOnError === true
        ? Result.succeed(emptyStruct)
        : structResult
    );
}
