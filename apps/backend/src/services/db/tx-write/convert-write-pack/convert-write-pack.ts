import { Result } from '@praha/byethrow';
import type { DbTabsPack } from '#backend/interfaces/db-tabs-pack';
import type { DbTableRegistry } from '#backend/services/db/create-db-table-registry';
import { dbTableKeys } from '#backend/services/db/db-entity-registry';
import type { DbWriteOperation } from '#backend/services/db/db-write-operation';
import {
  type ConvertTabsPackKeyOutput,
  convertTabsPackKey
} from '#backend/services/db/tx-write/convert-write-pack/convert-tabs-pack-key/convert-tabs-pack-key';
import type { ConvertWritePackError } from '#common/types/backend/function-errors/convert-write-pack-error';

export type ConvertWritePackOutput = {
  operation: DbWriteOperation;
  tableConversions: ConvertTabsPackKeyOutput[];
};

export function convertWritePack(item: {
  operation: DbWriteOperation;
  tabsPack: DbTabsPack;
  hashSecret?: string;
  tableRegistry: DbTableRegistry;
}): Result.Result<ConvertWritePackOutput, ConvertWritePackError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind('tableConversions', v =>
      Result.sequence(dbTableKeys, key =>
        convertTabsPackKey({
          key: key,
          tabsPack: v.tabsPack,
          hashSecret: v.hashSecret,
          tableRegistry: v.tableRegistry
        })
      )
    ),
    Result.map(
      (v): ConvertWritePackOutput => ({
        operation: v.operation,
        tableConversions: v.tableConversions
      })
    )
  );
}
