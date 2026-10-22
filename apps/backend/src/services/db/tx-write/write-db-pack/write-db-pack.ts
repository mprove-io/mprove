import pIteration from 'p-iteration';
import type { DbEntsPack } from '#backend/interfaces/db-ents-pack';
import {
  type DbWriteEntityRegistry,
  type DbWriteTableKey,
  dbEntityRegistry,
  dbTableKeys
} from '#backend/services/db/db-entity-registry';
import type { DbTransaction } from '#backend/services/db/db-transaction';
import type { DbWriteOperation } from '#backend/services/db/db-write-operation';
import { writeDbTable } from '#backend/services/db/tx-write/write-db-pack/write-db-table/write-db-table';

const { forEachSeries } = pIteration;

export async function writeDbPack(item: {
  tx: DbTransaction;
  entsPack: DbEntsPack;
  operation: DbWriteOperation;
}): Promise<void> {
  let { tx, entsPack, operation } = item;

  let entityRegistry: DbWriteEntityRegistry = dbEntityRegistry;

  await forEachSeries(
    dbTableKeys,
    async (key: DbWriteTableKey): Promise<void> => {
      let config: DbWriteEntityRegistry[DbWriteTableKey] = entityRegistry[key];

      if (config.write.operations.indexOf(operation) < 0) {
        return;
      }

      await writeDbTable({
        tx: tx,
        table: config.table,
        identityKey: config.write.identityKey,
        operation: operation,
        ents: entsPack[key] ?? []
      });
    }
  );
}
