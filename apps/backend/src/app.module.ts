import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import {
  Logger,
  Module,
  type OnModuleDestroy,
  type OnModuleInit
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ScheduleModule } from '@nestjs/schedule';
import { seconds, ThrottlerModule } from '@nestjs/throttler';
import { DefaultLogger, eq, isNotNull } from 'drizzle-orm';
import {
  drizzle as drizzlePg,
  type NodePgDatabase
} from 'drizzle-orm/node-postgres';
import { migrate as migratePg } from 'drizzle-orm/node-postgres/migrator';
import Redis from 'ioredis';
import pg, { type ClientConfig } from 'pg';
import type { BackendConfig } from '#backend/config/backend-config';
import type { DconfigTab } from '#backend/drizzle/postgres/tables/dconfigs';
import type { UconfigTab } from '#backend/drizzle/postgres/tables/uconfigs';
import type { UserTab } from '#backend/drizzle/postgres/tables/users';
import { checkAppRecordsEncryption } from '#backend/functions/app/check-app-records-encryption/check-app-records-encryption';
import { seedAppDemoOrgAndProject } from '#backend/functions/app/seed-app-demo-org-and-project/seed-app-demo-org-and-project';
import { getDconfigHashSecretUnwrap } from '#backend/functions/db/dconfigs/get-dconfig-hash-secret-unwrap/get-dconfig-hash-secret-unwrap';
import { addMproveAdminUser } from '#backend/functions/db/users/add-mprove-admin-user/add-mprove-admin-user';
import { createHashSecret } from '#backend/functions/hash/create-hash-secret/create-hash-secret';
import { makeHashUnwrap } from '#backend/functions/hash/make-hash-unwrap/make-hash-unwrap';
import { logToConsoleBackend } from '#backend/functions/top/log-to-console-backend/log-to-console-backend';
import { JwtAuthGuard } from '#backend/guards/jwt-auth/jwt-auth.guard';
import { ZodValidationPipe } from '#backend/pipes/zod-validation/zod-validation.pipe';
import { DbService } from '#backend/services/db/db.service';
import { RpcService } from '#backend/services/rpc/rpc.service';
import { TabService } from '#backend/services/tab/tab.service';
import { THROTTLE_MULTIPLIER } from '#common/constants/top-backend';
import { isDefinedAndNotEmpty } from '#common/functions/is-defined-and-not-empty/is-defined-and-not-empty';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import { makeId } from '#common/functions/make-id/make-id';
import { WithTraceSpan } from '#node-common/decorators/with-trace-span.decorator';
import { appControllers } from './app-controllers';
import { AppFilter } from './app-filter';
import { AppInterceptor } from './app-interceptor';
import { appProviders } from './app-providers';
import { getConfig } from './config/get.config';
import { DrizzleModule } from './drizzle/drizzle.module';
import { DrizzleLogWriter } from './drizzle/drizzle-log-writer';
import type { schemaPostgres } from './drizzle/postgres/schema-postgres';
import { dconfigsTable } from './drizzle/postgres/tables/dconfigs';
import { uconfigsTable } from './drizzle/postgres/tables/uconfigs';
import { usersTable } from './drizzle/postgres/tables/users';

const { Client } = pg;

let configModule = ConfigModule.forRoot({
  load: [getConfig],
  isGlobal: true
});

let jwtModule = JwtModule.registerAsync({
  inject: [ConfigService],
  useFactory: async (cs: ConfigService<BackendConfig>) => ({
    secret: cs.get<BackendConfig['jwtSecret']>('jwtSecret'),
    signOptions: { expiresIn: '30d' }
  })
});

// Store throttler Redis client at module level for proper lifecycle management
let throttlerRedisClient: Redis;

let customThrottlerModule = ThrottlerModule.forRootAsync({
  inject: [ConfigService],
  useFactory: (cs: ConfigService<BackendConfig>) => {
    let valkeyHost =
      cs.get<BackendConfig['backendValkeyHost']>('backendValkeyHost');

    let valkeyPassword = cs.get<BackendConfig['backendValkeyPassword']>(
      'backendValkeyPassword'
    );

    // Create Redis client instance for proper lifecycle management
    throttlerRedisClient = new Redis({
      host: valkeyHost,
      port: 6379,
      password: valkeyPassword
    });

    return {
      throttlers: [
        {
          name: '1s',
          ttl: seconds(1),
          blockDuration: seconds(1),
          limit: 10 * THROTTLE_MULTIPLIER
        },
        {
          name: '5s',
          ttl: seconds(5),
          blockDuration: seconds(5),
          limit: 20 * THROTTLE_MULTIPLIER
        },
        {
          name: '60s',
          ttl: seconds(60),
          blockDuration: seconds(60),
          limit: 100 * THROTTLE_MULTIPLIER
        },
        {
          name: '600s',
          ttl: seconds(600),
          blockDuration: seconds(12 * 60 * 60), // 12h
          limit: 300 * THROTTLE_MULTIPLIER
        }
      ],
      storage: new ThrottlerStorageRedisService(throttlerRedisClient)
    };
  }
});

@Module({
  imports: [
    configModule,
    ScheduleModule.forRoot(),
    jwtModule,
    customThrottlerModule,
    PassportModule,
    DrizzleModule
  ],
  controllers: appControllers,
  providers: [
    Logger,
    ...appProviders,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard
    },
    {
      provide: APP_FILTER,
      useClass: AppFilter
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AppInterceptor
    },
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe
    }
  ]
})
export class AppModule implements OnModuleInit, OnModuleDestroy {
  constructor(
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    private db: DbService,
    private rpcService: RpcService,
    private tabService: TabService
  ) {}

  @WithTraceSpan()
  async onModuleInit() {
    try {
      if (this.cs.get<BackendConfig['isScheduler']>('isScheduler') === true) {
        // migrations

        let clientConfig: ClientConfig = {
          connectionString: this.cs.get<
            BackendConfig['backendPostgresDatabaseUrl']
          >('backendPostgresDatabaseUrl'),
          ssl:
            this.cs.get<BackendConfig['backendIsPostgresTls']>(
              'backendIsPostgresTls'
            ) === true
              ? {
                  rejectUnauthorized: false
                }
              : false
        };

        let postgresSingleClient = new Client(clientConfig);

        await postgresSingleClient.connect();

        let isLogDrizzlePostgres = this.cs.get<
          BackendConfig['backendLogDrizzlePostgres']
        >('backendLogDrizzlePostgres');

        let prefixPostgres = 'POSTGRES';

        let postgresSingleDrizzle: NodePgDatabase<typeof schemaPostgres> =
          drizzlePg(postgresSingleClient, {
            logger:
              isLogDrizzlePostgres === true
                ? new DefaultLogger({
                    writer: new DrizzleLogWriter(
                      this.logger,
                      this.cs,
                      prefixPostgres
                    )
                  })
                : undefined
          });

        let migrationsFolder = resolve(
          dirname(fileURLToPath(import.meta.url)),
          'drizzle/postgres/migrations'
        );

        await migratePg(postgresSingleDrizzle, {
          migrationsFolder
        });

        // dconfig

        let dconfig: DconfigTab = await this.db.dconfigs.findFirstUnwrap({
          where: isNotNull(dconfigsTable.dconfigId)
        });

        if (isUndefined(dconfig)) {
          let hashSecret = createHashSecret();

          let dconfigInit: DconfigTab = {
            dconfigId: makeId(),
            hashSecret: hashSecret,
            hashSecretCheck: undefined, // set in checkEncryption
            keyTag: undefined, // tab-to-ent sets keyTag
            serverTs: undefined
          };

          await this.db.writeUnwrap({
            insert: {
              dconfigs: [dconfigInit]
            }
          });
        }

        // encryption

        await checkAppRecordsEncryption({
          cs: this.cs,
          db: this.db
        });

        // uconfig

        let uconfig: UconfigTab = await this.db.uconfigs.findFirstUnwrap({
          where: isNotNull(uconfigsTable.uconfigId)
        });

        if (isUndefined(uconfig)) {
          let uconfigInit: UconfigTab = {
            uconfigId: makeId(),
            keyTag: undefined,
            serverTs: undefined
          };

          await this.db.writeUnwrap({
            insert: {
              uconfigs: [uconfigInit]
            }
          });
        }

        // admin

        let mproveAdminEmail =
          this.cs.get<BackendConfig['mproveAdminEmail']>('mproveAdminEmail');

        let mproveAdminInitialPassword = this.cs.get<
          BackendConfig['mproveAdminInitialPassword']
        >('mproveAdminInitialPassword');

        let mproveAdminUser: UserTab;

        if (
          isDefinedAndNotEmpty(mproveAdminEmail) &&
          isDefinedAndNotEmpty(mproveAdminInitialPassword)
        ) {
          let hashSecret = await getDconfigHashSecretUnwrap({ db: this.db });

          let mproveAdminEmailHash = makeHashUnwrap({
            input: mproveAdminEmail,
            hashSecret: hashSecret
          });

          mproveAdminUser = await this.db.users.findFirstUnwrap({
            where: eq(usersTable.emailHash, mproveAdminEmailHash)
          });

          if (isUndefined(mproveAdminUser)) {
            mproveAdminUser = await addMproveAdminUser({
              email: mproveAdminEmail,
              password: mproveAdminInitialPassword,
              db: this.db
            });
          }
        }

        // demo

        let isSeedDemoOrgAndProject = this.cs.get<
          BackendConfig['seedDemoOrgAndProject']
        >('seedDemoOrgAndProject');

        if (isSeedDemoOrgAndProject === true) {
          await seedAppDemoOrgAndProject({
            cs: this.cs,
            logger: this.logger,
            db: this.db,
            rpcService: this.rpcService,
            tabService: this.tabService,
            mproveAdminUser: mproveAdminUser
          });
        }
      }
    } catch (e) {
      logToConsoleBackend({
        log: e,
        logLevel: 'Error',
        logger: this.logger,
        cs: this.cs
      });

      process.exit(1);
    }

    setTimeout(() => {
      let backendEnv = this.cs.get<BackendConfig['backendEnv']>('backendEnv');

      if (backendEnv !== 'TEST') {
        logToConsoleBackend({
          log: `NODE_ENV "${process.env.NODE_ENV}", BACKEND_ENV "${backendEnv}"`,
          logLevel: 'Info',
          logger: this.logger,
          cs: this.cs
        });
      }
    }, 1000);
  }

  async onModuleDestroy(): Promise<void> {
    if (throttlerRedisClient) {
      await throttlerRedisClient.quit();
    }
  }
}
