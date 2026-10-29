import pgPromise from 'pg-promise';
import type pg from 'pg-promise/typescript/pg-subset';
import type { ConnectionTab } from '#backend/drizzle/postgres/schema/_tabs';
import { optionsToPgOptions } from '#backend/functions/dwh/pg/options-to-pg-options/options-to-pg-options';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { TestConnectionResult } from '#common/types/backend/parts/connections/test-connection-result';

export async function testPgConnection(item: {
  connection: ConnectionTab;
}): Promise<TestConnectionResult> {
  let { connection } = item;

  let postgresConnectionOptions: pg.IConnectionParameters<pg.IClient> =
    optionsToPgOptions({
      connection: connection
    });

  try {
    let errorMessage: string;

    let pgp: pgPromise.IMain<{}, pg.IClient> = pgPromise({ noWarnings: true });

    let pgDb: pgPromise.IDatabase<{}, pg.IClient> = pgp(
      postgresConnectionOptions
    );

    let pc: void | pgPromise.IConnected<{}, pg.IClient> = await pgDb
      .connect()
      .catch(e => {
        errorMessage = `Connection failed: ${e.message}`;
      });

    if (isDefined(errorMessage) === true) {
      let testConnectionResult: TestConnectionResult = {
        isSuccess: false,
        errorMessage: errorMessage
      };

      return testConnectionResult;
    } else if (!pc) {
      let testConnectionResult: TestConnectionResult = {
        isSuccess: false,
        errorMessage: 'Connection failed'
      };

      return testConnectionResult;
    }

    pgDb.$pool.end();

    let testConnectionResult: TestConnectionResult = {
      isSuccess: true,
      errorMessage: undefined
    };

    return testConnectionResult;
  } catch (err: any) {
    let testConnectionResult: TestConnectionResult = {
      isSuccess: false,
      errorMessage: `Connection failed: ${err.message}`
    };

    return testConnectionResult;
  }
}
