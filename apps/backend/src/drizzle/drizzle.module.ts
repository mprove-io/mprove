import { instrumentDrizzleClient } from '@kubiks/otel-drizzle';
import { Inject, Logger, Module, OnModuleDestroy } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DefaultLogger, DrizzleConfig } from 'drizzle-orm';
import {
  drizzle as drizzlePg,
  NodePgDatabase
} from 'drizzle-orm/node-postgres';
import type { PoolConfig, Pool as PoolType } from 'pg';
import pg from 'pg';

const { Pool } = pg;

import { BackendConfig } from '#backend/config/backend-config';
import { getConfig } from '#backend/config/get.config';
import { DrizzleLogWriter } from './drizzle-log-writer';
import { schemaPostgres } from './postgres/schema-postgres';

export const DRIZZLE = 'DRIZZLE';

export interface DbExtra {
  drizzle: NodePgDatabase<typeof schemaPostgres>;
  pool: PoolType;
}

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [getConfig],
      isGlobal: true
    })
  ],
  providers: [
    ConfigService,
    Logger,
    {
      provide: DRIZZLE,
      inject: [ConfigService, Logger],
      useFactory: (cs: ConfigService<BackendConfig>, logger: Logger) => {
        let poolConfig: PoolConfig = {
          connectionString: cs.get<BackendConfig['backendPostgresDatabaseUrl']>(
            'backendPostgresDatabaseUrl'
          ),
          ssl:
            cs.get<BackendConfig['backendIsPostgresTls']>(
              'backendIsPostgresTls'
            ) === true
              ? {
                  rejectUnauthorized: false
                }
              : false
        };

        let postgresPool = new Pool(poolConfig);

        let pgDrizzleConfig: DrizzleConfig<typeof schemaPostgres> = {
          schema: schemaPostgres
        };

        if (
          cs.get<BackendConfig['backendLogDrizzlePostgres']>(
            'backendLogDrizzlePostgres'
          ) === true
        ) {
          let prefixPostgres = 'POSTGRES';

          pgDrizzleConfig.logger = new DefaultLogger({
            writer: new DrizzleLogWriter(logger, cs, prefixPostgres)
          });
        }

        let postgresPoolDrizzle: NodePgDatabase<typeof schemaPostgres> =
          drizzlePg(postgresPool, pgDrizzleConfig);

        if (
          cs.get<BackendConfig['isTraceDrizzleEnabled']>(
            'isTraceDrizzleEnabled'
          ) === true
        ) {
          instrumentDrizzleClient(postgresPoolDrizzle, {
            dbSystem: 'postgresql'
          });
        }

        let dbExtra: DbExtra = {
          drizzle: postgresPoolDrizzle,
          pool: postgresPool
        };

        return dbExtra;
      }
    }
  ],
  exports: [DRIZZLE]
})
export class DrizzleModule implements OnModuleDestroy {
  constructor(@Inject(DRIZZLE) private dbExtra: DbExtra) {}

  async onModuleDestroy(): Promise<void> {
    const pool = this.dbExtra.pool;

    // Wait up to 5 seconds for active queries to complete
    const maxWaitMs = 5000;
    const checkIntervalMs = 100;
    let waited = 0;

    while (waited < maxWaitMs) {
      const activeConnections = pool.totalCount - pool.idleCount;
      if (activeConnections === 0) {
        break;
      }
      await new Promise(resolve => setTimeout(resolve, checkIntervalMs));
      waited += checkIntervalMs;
    }

    await pool.end();
  }
}
