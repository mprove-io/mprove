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
import { HashService } from '#backend/services/hash.service';
import { TabService } from '#backend/services/tab.service';
import { TabToEntService } from '#backend/services/tab-to-ent.service';
import { DrizzleLogWriter } from './drizzle-log-writer';
import { DrizzlePacker } from './postgres/drizzle-packer';
import { schemaPostgres } from './postgres/schema/_schema-postgres';

export const DRIZZLE = 'DRIZZLE';

export interface Db {
  drizzle: NodePgDatabase<typeof schemaPostgres>;
  packer: DrizzlePacker;
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
    HashService,
    TabService,
    TabToEntService,
    {
      provide: DRIZZLE,
      inject: [ConfigService, Logger, TabService, TabToEntService],
      useFactory: (
        cs: ConfigService<BackendConfig>,
        logger: Logger,
        tabService: TabService,
        tabToEntService: TabToEntService
      ) => {
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

        instrumentDrizzleClient(postgresPoolDrizzle, {
          dbSystem: 'postgresql'
        });

        let postgresPacker = new DrizzlePacker(tabService, tabToEntService);

        let db: Db = {
          drizzle: postgresPoolDrizzle,
          packer: postgresPacker,
          pool: postgresPool
        };

        return db;
      }
    }
  ],
  exports: [DRIZZLE]
})
export class DrizzleModule implements OnModuleDestroy {
  constructor(@Inject(DRIZZLE) private db: Db) {}

  async onModuleDestroy() {
    const pool = this.db.pool;

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
