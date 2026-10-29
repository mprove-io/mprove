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
import { and, DefaultLogger, eq, isNotNull } from 'drizzle-orm';
import {
  drizzle as drizzlePg,
  type NodePgDatabase
} from 'drizzle-orm/node-postgres';
import { migrate as migratePg } from 'drizzle-orm/node-postgres/migrator';
import fse from 'fs-extra';
import Redis from 'ioredis';
import type { ClientConfig } from 'pg';
import pg from 'pg';
import type { BackendConfig } from '#backend/config/backend-config';
import type { ConnectionTab } from '#backend/drizzle/postgres/tables/connections';
import type { DconfigTab } from '#backend/drizzle/postgres/tables/dconfigs';
import type { OrgTab } from '#backend/drizzle/postgres/tables/orgs';
import type { ProjectTab } from '#backend/drizzle/postgres/tables/projects';
import type { UconfigTab } from '#backend/drizzle/postgres/tables/uconfigs';
import type { UserTab } from '#backend/drizzle/postgres/tables/users';
import { makeConnection } from '#backend/functions/db/connections/make-connection/make-connection';
import { getDconfigHashSecretUnwrap } from '#backend/functions/db/dconfigs/get-dconfig-hash-secret-unwrap/get-dconfig-hash-secret-unwrap';
import { addDemoMemberToDemoProject } from '#backend/functions/db/members/add-demo-member-to-demo-project/add-demo-member-to-demo-project';
import { addOrgUnwrap } from '#backend/functions/db/orgs/add-org-unwrap/add-org-unwrap';
import { addProjectUnwrap } from '#backend/functions/db/projects/add-project-unwrap/add-project-unwrap';
import { addDemoUser } from '#backend/functions/db/users/add-demo-user/add-demo-user';
import { addMproveAdminUser } from '#backend/functions/db/users/add-mprove-admin-user/add-mprove-admin-user';
import { createHashSecret } from '#backend/functions/hash/create-hash-secret/create-hash-secret';
import { makeHashUnwrap } from '#backend/functions/hash/make-hash-unwrap/make-hash-unwrap';
import { logToConsoleBackend } from '#backend/functions/top/log-to-console-backend/log-to-console-backend';
import { JwtAuthGuard } from '#backend/guards/jwt-auth/jwt-auth.guard';
import { ZodValidationPipe } from '#backend/pipes/zod-validation/zod-validation.pipe';
import { DbService } from '#backend/services/db/db.service';
import { RpcService } from '#backend/services/rpc/rpc.service';
import { TabService } from '#backend/services/tab/tab.service';
import { ServerError } from '#common/classes/server-error/server-error';
import {
  DEMO_ORG_NAME,
  PROJECT_ENV_PROD,
  RESTRICTED_USER_EMAIL,
  RESTRICTED_USER_PASSWORD
} from '#common/constants/top';
import { THROTTLE_MULTIPLIER } from '#common/constants/top-backend';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isDefinedAndNotEmpty } from '#common/functions/is-defined-and-not-empty/is-defined-and-not-empty';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import { makeId } from '#common/functions/make-id/make-id';
import type { Ev } from '#common/types/backend/parts/ev';
import { WithTraceSpan } from '#node-common/decorators/with-trace-span.decorator';
import { appControllers } from './app-controllers';
import { AppFilter } from './app-filter';
import { AppInterceptor } from './app-interceptor';
import { appProviders } from './app-providers';
import { getConfig } from './config/get.config';
import { DrizzleModule } from './drizzle/drizzle.module';
import { DrizzleLogWriter } from './drizzle/drizzle-log-writer';
import type { schemaPostgres } from './drizzle/postgres/schema-postgres';
import { connectionsTable } from './drizzle/postgres/tables/connections';
import { dconfigsTable } from './drizzle/postgres/tables/dconfigs';
import { orgsTable } from './drizzle/postgres/tables/orgs';
import { projectsTable } from './drizzle/postgres/tables/projects';
import { uconfigsTable } from './drizzle/postgres/tables/uconfigs';
import { usersTable } from './drizzle/postgres/tables/users';
import { mcpProviders } from './mcp-providers';

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
    ...mcpProviders,
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

        await this.checkRecordsEncryption();

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
          await this.seedDemoOrgAndProject({
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

  async checkRecordsEncryption() {
    let keyBase64 = this.cs.get<BackendConfig['aesKey']>('aesKey');
    let keyTag = this.cs.get<BackendConfig['aesKeyTag']>('aesKeyTag');

    let prevKeyBase64 = this.cs.get<BackendConfig['prevAesKey']>('prevAesKey');
    let prevKeyTag =
      this.cs.get<BackendConfig['prevAesKeyTag']>('prevAesKeyTag');

    let isEncryptDb = this.cs.get<BackendConfig['isEncryptDb']>('isEncryptDb');

    let isEncryptMetadata =
      this.cs.get<BackendConfig['isEncryptMetadata']>('isEncryptMetadata');

    if (isEncryptMetadata === true && isEncryptDb === false) {
      throw new ServerError({
        message: 'BACKEND_ENCRYPT_METADATA_DOES_NOT_WORK_WITHOUT_ENCRYPT_DB'
      });
    }

    if (isUndefined(keyBase64)) {
      throw new ServerError({
        message: 'BACKEND_AES_KEY_IS_NOT_DEFINED'
      });
    }

    if (isUndefined(keyTag)) {
      throw new ServerError({
        message: 'BACKEND_AES_KEY_TAG_IS_NOT_DEFINED'
      });
    }

    if (isDefined(prevKeyBase64) && isUndefined(prevKeyTag)) {
      throw new ServerError({
        message:
          'BACKEND_PREV_AES_KEY_IS_DEFINED_BUT_PREV_AES_KEY_TAG_IS_NOT_DEFINED'
      });
    }

    let dconfigA: DconfigTab = await this.db.dconfigs.findFirstUnwrap({
      where: isNotNull(dconfigsTable.dconfigId)
    });

    if (isUndefined(dconfigA)) {
      throw new ServerError({
        message: 'BACKEND_DCONFIG_IS_NOT_DEFINED'
      });
    }

    let isUpdateHashSecret = false;

    if (
      (isEncryptDb === true && dconfigA.keyTag !== keyTag) ||
      dconfigA.hashSecret !== dconfigA.hashSecretCheck
    ) {
      isUpdateHashSecret = true;
    }

    if (isUpdateHashSecret === true) {
      dconfigA.hashSecret = createHashSecret(); // hashSecretCheck is prev value

      await this.db.writeUnwrap({
        update: {
          dconfigs: [dconfigA] // tab-to-ent sets keyTag
        }
      });
    }

    await this.db.rewriteRecordsUnwrap({
      isAllRecords: isUpdateHashSecret
    });

    let dconfigB: DconfigTab = await this.db.dconfigs.findFirstUnwrap({
      where: isNotNull(dconfigsTable.dconfigId)
    });

    dconfigB.hashSecretCheck = dconfigB.hashSecret;

    await this.db.writeUnwrap({
      update: {
        dconfigs: [dconfigB] // tab-to-ent sets keyTag
      }
    });
  }

  async seedDemoOrgAndProject(item: { mproveAdminUser: UserTab }) {
    let { mproveAdminUser } = item;

    let demoOrgId = this.cs.get<BackendConfig['demoOrgId']>('demoOrgId');

    let demoProjectId =
      this.cs.get<BackendConfig['demoProjectId']>('demoProjectId');

    let demoProjectName =
      this.cs.get<BackendConfig['demoProjectName']>('demoProjectName');

    if (
      isDefined(mproveAdminUser) &&
      isDefinedAndNotEmpty(demoOrgId) &&
      isDefinedAndNotEmpty(demoProjectId)
    ) {
      let demoOrg: OrgTab = await this.db.orgs.findFirstUnwrap({
        where: eq(orgsTable.orgId, demoOrgId)
      });

      if (isUndefined(demoOrg)) {
        demoOrg = await addOrgUnwrap({
          ownerId: mproveAdminUser.userId,
          ownerEmail: mproveAdminUser.email,
          name: DEMO_ORG_NAME,
          traceId: makeId(),
          orgId: demoOrgId,
          rpcService: this.rpcService,
          db: this.db
        });
      }

      let connections = await this.addDemoConnections({
        demoProjectId: demoProjectId
      });

      let demoProject: ProjectTab = await this.db.projects.findFirstUnwrap({
        where: eq(projectsTable.projectId, demoProjectId)
      });

      if (isUndefined(demoProject)) {
        let demoProjectRemoteType = this.cs.get<
          BackendConfig['demoProjectRemoteType']
        >('demoProjectRemoteType');

        let demoProjectRemoteGitUrl = this.cs.get<
          BackendConfig['demoProjectRemoteGitUrl']
        >('demoProjectRemoteGitUrl');

        let demoProjectRemotePrivateKeyEncryptedPath = this.cs.get<
          BackendConfig['demoProjectRemotePrivateKeyEncryptedPath']
        >('demoProjectRemotePrivateKeyEncryptedPath');

        let demoProjectRemotePublicKeyPath = this.cs.get<
          BackendConfig['demoProjectRemotePublicKeyPath']
        >('demoProjectRemotePublicKeyPath');

        let demoProjectRemotePassPhrase = this.cs.get<
          BackendConfig['demoProjectRemotePassPhrase']
        >('demoProjectRemotePassPhrase');

        let privateKeyEncrypted;
        let publicKey;

        if (
          isDefinedAndNotEmpty(demoProjectRemotePrivateKeyEncryptedPath) &&
          isDefinedAndNotEmpty(demoProjectRemotePublicKeyPath)
        ) {
          privateKeyEncrypted = fse
            .readFileSync(demoProjectRemotePrivateKeyEncryptedPath)
            .toString();

          publicKey = fse
            .readFileSync(demoProjectRemotePublicKeyPath)
            .toString();
        }

        let ev1: Ev = {
          evId: 'MPROVE_SNOWFLAKE_DATABASE',
          val: 's_db'
        };

        let demoProjectE2bApiKey = this.cs.get<
          BackendConfig['demoProjectE2bApiKey']
        >('demoProjectE2bApiKey');

        demoProject = await addProjectUnwrap({
          orgId: demoOrg.orgId,
          name: demoProjectName,
          user: mproveAdminUser,
          traceId: makeId(),
          projectId: demoProjectId,
          seedProjectId: 'demo-project',
          remoteType: demoProjectRemoteType,
          gitUrl: demoProjectRemoteGitUrl,
          publicKey: publicKey,
          publicKeyEncrypted: undefined,
          privateKey: undefined,
          privateKeyEncrypted: privateKeyEncrypted,
          passPhrase: demoProjectRemotePassPhrase,
          e2bApiKey: demoProjectE2bApiKey,
          evs: [ev1],
          connections: connections,
          tabService: this.tabService,
          rpcService: this.rpcService,
          db: this.db,
          cs: this.cs,
          logger: this.logger
        });
      }

      let hashSecret = await getDconfigHashSecretUnwrap({ db: this.db });

      let demoUserEmail = RESTRICTED_USER_EMAIL;
      let demoUserInitialPassword = RESTRICTED_USER_PASSWORD;

      let demoUserEmailHash = makeHashUnwrap({
        input: demoUserEmail,
        hashSecret: hashSecret
      });

      let demoUser: UserTab = await this.db.users.findFirstUnwrap({
        where: eq(usersTable.emailHash, demoUserEmailHash)
      });

      if (isUndefined(demoUser)) {
        demoUser = await addDemoUser({
          email: demoUserEmail,
          password: demoUserInitialPassword,
          db: this.db
        });

        await addDemoMemberToDemoProject({
          user: demoUser,
          cs: this.cs,
          db: this.db
        });
      }
    }
  }

  async addDemoConnections(item: { demoProjectId: string }) {
    let { demoProjectId } = item;

    let connections: ConnectionTab[] = [];

    let isC1ConnectionExist: boolean = await this.db.connections.isExistUnwrap({
      where: and(
        eq(connectionsTable.projectId, demoProjectId),
        eq(connectionsTable.envId, PROJECT_ENV_PROD),
        eq(connectionsTable.connectionId, 'c1_postgres')
      )
    });

    let demoProjectDwhPostgresPassword = this.cs.get<
      BackendConfig['demoProjectDwhPostgresPassword']
    >('demoProjectDwhPostgresPassword');

    if (
      !isC1ConnectionExist &&
      isDefinedAndNotEmpty(demoProjectDwhPostgresPassword)
    ) {
      let c1 = makeConnection({
        projectId: demoProjectId,
        envId: PROJECT_ENV_PROD,
        connectionId: 'c1_postgres',
        type: 'PostgreSQL',
        options: {
          postgres: {
            host: this.cs.get<BackendConfig['demoProjectDwhPostgresHost']>(
              'demoProjectDwhPostgresHost'
            ),
            port: 5436,
            database: 'p_db',
            username: this.cs.get<BackendConfig['demoProjectDwhPostgresUser']>(
              'demoProjectDwhPostgresUser'
            ),
            password: demoProjectDwhPostgresPassword,
            isSSL: false
          }
        }
      });

      connections.push(c1);
    }

    let isC3ConnectionExist: boolean = await this.db.connections.isExistUnwrap({
      where: and(
        eq(connectionsTable.projectId, demoProjectId),
        eq(connectionsTable.envId, PROJECT_ENV_PROD),
        eq(connectionsTable.connectionId, 'c3_bigquery')
      )
    });

    let demoProjectDwhBigqueryCredentialsPath = this.cs.get<
      BackendConfig['demoProjectDwhBigqueryCredentialsPath']
    >('demoProjectDwhBigqueryCredentialsPath');

    if (
      !isC3ConnectionExist &&
      isDefinedAndNotEmpty(demoProjectDwhBigqueryCredentialsPath)
    ) {
      let bigqueryTestCredentials = JSON.parse(
        fse.readFileSync(demoProjectDwhBigqueryCredentialsPath).toString()
      );

      let c3 = makeConnection({
        projectId: demoProjectId,
        envId: PROJECT_ENV_PROD,
        connectionId: 'c3_bigquery',
        type: 'BigQuery',
        options: {
          bigquery: {
            serviceAccountCredentials: bigqueryTestCredentials,
            googleCloudProject: bigqueryTestCredentials?.project_id,
            googleCloudClientEmail: bigqueryTestCredentials?.client_email,
            bigqueryQuerySizeLimitGb: 1
          }
        }
      });

      connections.push(c3);
    }

    let isC4ConnectionExist: boolean = await this.db.connections.isExistUnwrap({
      where: and(
        eq(connectionsTable.projectId, demoProjectId),
        eq(connectionsTable.envId, PROJECT_ENV_PROD),
        eq(connectionsTable.connectionId, 'c4_snowflake')
      )
    });

    let demoProjectDwhSnowflakeAccount = this.cs.get<
      BackendConfig['demoProjectDwhSnowflakeAccount']
    >('demoProjectDwhSnowflakeAccount');

    if (
      !isC4ConnectionExist &&
      isDefinedAndNotEmpty(demoProjectDwhSnowflakeAccount)
    ) {
      let c4 = makeConnection({
        projectId: demoProjectId,
        envId: PROJECT_ENV_PROD,
        connectionId: 'c4_snowflake',
        type: 'SnowFlake',
        options: {
          snowflake: {
            account: demoProjectDwhSnowflakeAccount,
            warehouse: this.cs.get<
              BackendConfig['demoProjectDwhSnowflakeWarehouse']
            >('demoProjectDwhSnowflakeWarehouse'),
            database: undefined,
            username: this.cs.get<
              BackendConfig['demoProjectDwhSnowflakeUsername']
            >('demoProjectDwhSnowflakeUsername'),
            password: this.cs.get<
              BackendConfig['demoProjectDwhSnowflakePassword']
            >('demoProjectDwhSnowflakePassword')
          }
        }
      });

      connections.push(c4);
    }

    let isC5ConnectionExist: boolean = await this.db.connections.isExistUnwrap({
      where: and(
        eq(connectionsTable.projectId, demoProjectId),
        eq(connectionsTable.envId, PROJECT_ENV_PROD),
        eq(connectionsTable.connectionId, 'c5_duckdb')
      )
    });

    let demoProjectDwhMotherDuckToken = this.cs.get<
      BackendConfig['demoProjectDwhMotherDuckToken']
    >('demoProjectDwhMotherDuckToken');

    if (
      !isC5ConnectionExist &&
      isDefinedAndNotEmpty(demoProjectDwhMotherDuckToken)
    ) {
      let c5 = makeConnection({
        projectId: demoProjectId,
        envId: PROJECT_ENV_PROD,
        connectionId: 'c5_duckdb',
        type: 'MotherDuck',
        options: {
          motherduck: {
            motherduckToken: demoProjectDwhMotherDuckToken,
            database: 'db1',
            attachModeSingle: true,
            accessModeReadOnly: true
          }
        }
      });

      connections.push(c5);
    }

    let isC6ConnectionExist: boolean = await this.db.connections.isExistUnwrap({
      where: and(
        eq(connectionsTable.projectId, demoProjectId),
        eq(connectionsTable.envId, PROJECT_ENV_PROD),
        eq(connectionsTable.connectionId, 'c6_mysql')
      )
    });

    let demoProjectDwhMysqlPassword = this.cs.get<
      BackendConfig['demoProjectDwhMysqlPassword']
    >('demoProjectDwhMysqlPassword');

    if (
      !isC6ConnectionExist &&
      isDefinedAndNotEmpty(demoProjectDwhMysqlPassword)
    ) {
      let c6 = makeConnection({
        projectId: demoProjectId,
        envId: PROJECT_ENV_PROD,
        connectionId: 'c6_mysql',
        type: 'MySQL',
        options: {
          mysql: {
            host: this.cs.get<BackendConfig['demoProjectDwhMysqlHost']>(
              'demoProjectDwhMysqlHost'
            ),
            port: this.cs.get<BackendConfig['demoProjectDwhMysqlPort']>(
              'demoProjectDwhMysqlPort'
            ),
            database: this.cs.get<BackendConfig['demoProjectDwhMysqlDatabase']>(
              'demoProjectDwhMysqlDatabase'
            ),
            user: this.cs.get<BackendConfig['demoProjectDwhMysqlUser']>(
              'demoProjectDwhMysqlUser'
            ),
            password: demoProjectDwhMysqlPassword
          }
        }
      });

      connections.push(c6);
    }

    let isC7ConnectionExist: boolean = await this.db.connections.isExistUnwrap({
      where: and(
        eq(connectionsTable.projectId, demoProjectId),
        eq(connectionsTable.envId, PROJECT_ENV_PROD),
        eq(connectionsTable.connectionId, 'c7_google')
      )
    });

    let demoProjectDwhGoogleApiCredentialsPath = this.cs.get<
      BackendConfig['demoProjectDwhGoogleApiCredentialsPath']
    >('demoProjectDwhGoogleApiCredentialsPath');

    if (
      !isC7ConnectionExist &&
      isDefinedAndNotEmpty(demoProjectDwhGoogleApiCredentialsPath)
    ) {
      let googleApiTestCredentials = JSON.parse(
        fse.readFileSync(demoProjectDwhGoogleApiCredentialsPath).toString()
      );

      let c7 = makeConnection({
        projectId: demoProjectId,
        envId: PROJECT_ENV_PROD,
        connectionId: 'c7_google',
        type: 'GoogleApi',
        options: {
          storeGoogleApi: {
            baseUrl: 'https://analyticsdata.googleapis.com',
            headers: [],
            googleAuthScopes: [
              'https://www.googleapis.com/auth/analytics.readonly'
            ],
            serviceAccountCredentials: googleApiTestCredentials,
            googleCloudProject: googleApiTestCredentials?.project_id,
            googleCloudClientEmail: googleApiTestCredentials?.client_email,
            googleAccessToken: undefined,
            googleAccessTokenExpiryDate: undefined
          }
        }
      });

      connections.push(c7);
    }

    let isC8ConnectionExist: boolean = await this.db.connections.isExistUnwrap({
      where: and(
        eq(connectionsTable.projectId, demoProjectId),
        eq(connectionsTable.envId, PROJECT_ENV_PROD),
        eq(connectionsTable.connectionId, 'c8_trino')
      )
    });

    let demoProjectDwhTrinoUser = this.cs.get<
      BackendConfig['demoProjectDwhTrinoUser']
    >('demoProjectDwhTrinoUser');

    if (!isC8ConnectionExist && isDefinedAndNotEmpty(demoProjectDwhTrinoUser)) {
      let c8 = makeConnection({
        projectId: demoProjectId,
        envId: PROJECT_ENV_PROD,
        connectionId: 'c8_trino',
        type: 'Trino',
        options: {
          trino: {
            server: 'http://dwh-trino:8081',
            catalog: undefined,
            schema: undefined,
            user: demoProjectDwhTrinoUser,
            password: this.cs.get<BackendConfig['demoProjectDwhTrinoPassword']>(
              'demoProjectDwhTrinoPassword'
            ),
            extraConfig: undefined
          }
        }
      });

      connections.push(c8);
    }

    let isC9ConnectionExist: boolean = await this.db.connections.isExistUnwrap({
      where: and(
        eq(connectionsTable.projectId, demoProjectId),
        eq(connectionsTable.envId, PROJECT_ENV_PROD),
        eq(connectionsTable.connectionId, 'c9_presto')
      )
    });

    let demoProjectDwhPrestoUser = this.cs.get<
      BackendConfig['demoProjectDwhPrestoUser']
    >('demoProjectDwhPrestoUser');

    if (
      !isC9ConnectionExist &&
      isDefinedAndNotEmpty(demoProjectDwhPrestoUser)
    ) {
      let c9 = makeConnection({
        projectId: demoProjectId,
        envId: PROJECT_ENV_PROD,
        connectionId: 'c9_presto',
        type: 'Presto',
        options: {
          presto: {
            server: 'http://dwh-presto',
            port: 8082,
            catalog: undefined,
            schema: undefined,
            user: demoProjectDwhPrestoUser,
            password: this.cs.get<
              BackendConfig['demoProjectDwhPrestoPassword']
            >('demoProjectDwhPrestoPassword'),
            extraConfig: undefined
          }
        }
      });

      connections.push(c9);
    }

    await this.db.writeUnwrap({
      insert: {
        connections: connections
      }
    });

    return connections;
  }

  async onModuleDestroy(): Promise<void> {
    if (throttlerRedisClient) {
      await throttlerRedisClient.quit();
    }
  }
}
