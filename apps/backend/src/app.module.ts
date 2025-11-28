import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { Inject, Logger, Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, seconds } from '@nestjs/throttler';
import { DefaultLogger, and, eq, isNotNull } from 'drizzle-orm';
import {
  NodePgDatabase,
  drizzle as drizzlePg
} from 'drizzle-orm/node-postgres';
import { migrate as migratePg } from 'drizzle-orm/node-postgres/migrator';
import * as fse from 'fs-extra';
import Redis from 'ioredis';
import { Client, ClientConfig } from 'pg';
import { BackendConfig } from '~backend/config/backend-config';
import {
  DEMO_ORG_NAME,
  PROJECT_ENV_PROD,
  RESTRICTED_USER_EMAIL,
  RESTRICTED_USER_PASSWORD
} from '~common/constants/top';
import { THROTTLE_MULTIPLIER } from '~common/constants/top-backend';
import { ConnectionTypeEnum } from '~common/enums/connection-type.enum';
import { BackendEnvEnum } from '~common/enums/env/backend-env.enum';
import { ErEnum } from '~common/enums/er.enum';
import { LogLevelEnum } from '~common/enums/log-level.enum';
import { RabbitExchangesEnum } from '~common/enums/rabbit-exchanges.enum';
import { isDefined } from '~common/functions/is-defined';
import { isDefinedAndNotEmpty } from '~common/functions/is-defined-and-not-empty';
import { isUndefined } from '~common/functions/is-undefined';
import { makeId } from '~common/functions/make-id';
import { Ev } from '~common/interfaces/backend/ev';
import { ServerError } from '~common/models/server-error';
import { appControllers } from './app-controllers';
import { AppFilter } from './app-filter';
import { AppInterceptor } from './app-interceptor';
import { appProviders } from './app-providers';
import { getConfig } from './config/get.config';
import { DrizzleLogWriter } from './drizzle/drizzle-log-writer';
import { DRIZZLE, Db, DrizzleModule } from './drizzle/drizzle.module';
import { schemaPostgres } from './drizzle/postgres/schema/_schema-postgres';
import {
  ConnectionTab,
  DconfigTab,
  UserTab
} from './drizzle/postgres/schema/_tabs';
import { connectionsTable } from './drizzle/postgres/schema/connections';
import { dconfigsTable } from './drizzle/postgres/schema/dconfigs';
import { orgsTable } from './drizzle/postgres/schema/orgs';
import { projectsTable } from './drizzle/postgres/schema/projects';
import { usersTable } from './drizzle/postgres/schema/users';
import { getRetryOption } from './functions/get-retry-option';
import { logToConsoleBackend } from './functions/log-to-console-backend';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ConnectionsService } from './services/db/connections.service';
import { DconfigsService } from './services/db/dconfigs.service';
import { MembersService } from './services/db/members.service';
import { OrgsService } from './services/db/orgs.service';
import { ProjectsService } from './services/db/projects.service';
import { UsersService } from './services/db/users.service';
import { HashService } from './services/hash.service';
import { TabCheckerService } from './services/tab-checker.service';
import { TabService } from './services/tab.service';

let retry = require('async-retry');

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

let rabbitModule = RabbitMQModule.forRootAsync(RabbitMQModule, {
  inject: [ConfigService],
  useFactory: (cs: ConfigService<BackendConfig>) => {
    let rabbitUser =
      cs.get<BackendConfig['backendRabbitUser']>('backendRabbitUser');
    let rabbitPass =
      cs.get<BackendConfig['backendRabbitPass']>('backendRabbitPass');
    let rabbitHost =
      cs.get<BackendConfig['backendRabbitHost']>('backendRabbitHost');
    let rabbitPort =
      cs.get<BackendConfig['backendRabbitPort']>('backendRabbitPort');
    let rabbitProtocol = cs.get<BackendConfig['backendRabbitProtocol']>(
      'backendRabbitProtocol'
    );

    let backendEnv = cs.get<BackendConfig['backendEnv']>('backendEnv');

    return {
      exchanges: [
        {
          name: RabbitExchangesEnum.Blockml.toString(),
          type: 'direct'
        },
        {
          name: RabbitExchangesEnum.Disk.toString(),
          type: 'direct'
        }
      ],
      uri: [
        `${rabbitProtocol}://${rabbitUser}:${rabbitPass}@${rabbitHost}:${rabbitPort}`
      ],
      connectionInitOptions: {
        // wait for connection on startup, but do not recover when connection lost
        wait: backendEnv === BackendEnvEnum.TEST ? true : false,
        timeout: backendEnv === BackendEnvEnum.TEST ? 75000 : undefined
      },
      connectionManagerOptions: {
        connectionOptions: { rejectUnauthorized: false }
      }
    };
  }
});

let customThrottlerModule = ThrottlerModule.forRootAsync({
  inject: [ConfigService],
  useFactory: (cs: ConfigService<BackendConfig>) => {
    let valkeyHost =
      cs.get<BackendConfig['backendValkeyHost']>('backendValkeyHost');

    let valkeyPassword = cs.get<BackendConfig['backendValkeyPassword']>(
      'backendValkeyPassword'
    );

    // the same as apps/backend/src/services/redis.service.ts
    let redisClient = new Redis({
      host: valkeyHost,
      port: 6379,
      password: valkeyPassword
      // ,
      // tls: {
      //   rejectUnauthorized: false
      // }
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
      storage: new ThrottlerStorageRedisService(redisClient)
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
    rabbitModule,
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
    }
  ]
})
export class AppModule implements OnModuleInit {
  constructor(
    private usersService: UsersService,
    private membersService: MembersService,
    private dconfigsService: DconfigsService,
    private orgsService: OrgsService,
    private checkTabService: TabCheckerService,
    private projectsService: ProjectsService,
    private connectionsService: ConnectionsService,
    private hashService: HashService,
    private tabService: TabService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

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

        await migratePg(postgresSingleDrizzle, {
          migrationsFolder: 'apps/backend/src/drizzle/postgres/migrations'
        });

        // dconfig

        let dconfig = await this.db.drizzle.query.dconfigsTable
          .findFirst({
            where: isNotNull(dconfigsTable.dconfigId)
          })
          .then(x => this.tabService.dconfigEntToTab(x));

        if (isUndefined(dconfig)) {
          let hashSecret = this.hashService.createHashSecret();

          let dconfigInit: DconfigTab = {
            dconfigId: makeId(),
            hashSecret: hashSecret,
            hashSecretCheck: undefined, // set in checkEncryption
            keyTag: undefined, // tab-to-ent sets keyTag
            serverTs: undefined
          };

          await retry(
            async () =>
              await this.db.drizzle.transaction(
                async tx =>
                  await this.db.packer.write({
                    tx: tx,
                    insert: {
                      dconfigs: [dconfigInit]
                    }
                  })
              ),
            getRetryOption(this.cs, this.logger)
          );
        }

        // encryption

        await this.checkRecordsEncryption();

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
          let hashSecret = await this.dconfigsService.getDconfigHashSecret();

          let mproveAdminEmailHash = this.hashService.makeHash({
            input: mproveAdminEmail,
            hashSecret: hashSecret
          });

          mproveAdminUser = await this.db.drizzle.query.usersTable
            .findFirst({
              where: eq(usersTable.emailHash, mproveAdminEmailHash)
            })
            .then(x => this.tabService.userEntToTab(x));

          if (isUndefined(mproveAdminUser)) {
            mproveAdminUser = await this.usersService.addMproveAdminUser({
              email: mproveAdminEmail,
              password: mproveAdminInitialPassword
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
        logLevel: LogLevelEnum.Error,
        logger: this.logger,
        cs: this.cs
      });

      process.exit(1);
    }

    setTimeout(() => {
      let backendEnv = this.cs.get<BackendConfig['backendEnv']>('backendEnv');

      if (backendEnv !== BackendEnvEnum.TEST) {
        logToConsoleBackend({
          log: `NODE_ENV "${process.env.NODE_ENV}", BACKEND_ENV "${backendEnv}"`,
          logLevel: LogLevelEnum.Info,
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
        message:
          ErEnum.BACKEND_ENCRYPT_METADATA_DOES_NOT_WORK_WITHOUT_ENCRYPT_DB
      });
    }

    if (isUndefined(keyBase64)) {
      throw new ServerError({
        message: ErEnum.BACKEND_AES_KEY_IS_NOT_DEFINED
      });
    }

    if (isUndefined(keyTag)) {
      throw new ServerError({
        message: ErEnum.BACKEND_AES_KEY_TAG_IS_NOT_DEFINED
      });
    }

    if (isDefined(prevKeyBase64) && isUndefined(prevKeyTag)) {
      throw new ServerError({
        message:
          ErEnum.BACKEND_PREV_AES_KEY_IS_DEFINED_BUT_PREV_AES_KEY_TAG_IS_NOT_DEFINED
      });
    }

    let dconfigA = await this.db.drizzle.query.dconfigsTable
      .findFirst({
        where: isNotNull(dconfigsTable.dconfigId)
      })
      .then(x => this.tabService.dconfigEntToTab(x));

    if (isUndefined(dconfigA)) {
      throw new ServerError({
        message: ErEnum.BACKEND_DCONFIG_IS_NOT_DEFINED
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
      dconfigA.hashSecret = this.hashService.createHashSecret(); // hashSecretCheck is prev value

      await retry(
        async () =>
          await this.db.drizzle.transaction(
            async tx =>
              await this.db.packer.write({
                tx: tx,
                update: {
                  dconfigs: [dconfigA] // tab-to-ent sets keyTag
                }
              })
          ),
        getRetryOption(this.cs, this.logger)
      );
    }

    await this.checkTabService.readWriteRecords({
      isAllRecords: isUpdateHashSecret
    });

    let dconfigB = await this.db.drizzle.query.dconfigsTable
      .findFirst({
        where: isNotNull(dconfigsTable.dconfigId)
      })
      .then(x => this.tabService.dconfigEntToTab(x));

    dconfigB.hashSecretCheck = dconfigB.hashSecret;

    await retry(
      async () =>
        await this.db.drizzle.transaction(
          async tx =>
            await this.db.packer.write({
              tx: tx,
              update: {
                dconfigs: [dconfigB] // tab-to-ent sets keyTag
              }
            })
        ),
      getRetryOption(this.cs, this.logger)
    );
  }

  async seedDemoOrgAndProject(item: {
    mproveAdminUser: UserTab;
  }) {
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
      let demoOrg = await this.db.drizzle.query.orgsTable
        .findFirst({
          where: eq(orgsTable.orgId, demoOrgId)
        })
        .then(x => this.tabService.orgEntToTab(x));

      if (isUndefined(demoOrg)) {
        demoOrg = await this.orgsService.addOrg({
          ownerId: mproveAdminUser.userId,
          ownerEmail: mproveAdminUser.email,
          name: DEMO_ORG_NAME,
          traceId: makeId(),
          orgId: demoOrgId
        });
      }

      let connections = await this.addDemoConnections({
        demoProjectId: demoProjectId
      });

      let demoProject = await this.db.drizzle.query.projectsTable
        .findFirst({
          where: eq(projectsTable.projectId, demoProjectId)
        })
        .then(x => this.tabService.projectEntToTab(x));

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

        demoProject = await this.projectsService.addProject({
          orgId: demoOrg.orgId,
          name: demoProjectName,
          user: mproveAdminUser,
          traceId: makeId(),
          projectId: demoProjectId,
          testProjectId: 'demo-project',
          remoteType: demoProjectRemoteType,
          gitUrl: demoProjectRemoteGitUrl,
          publicKey: publicKey,
          publicKeyEncrypted: undefined,
          privateKey: undefined,
          privateKeyEncrypted: privateKeyEncrypted,
          passPhrase: demoProjectRemotePassPhrase,
          evs: [ev1],
          connections: connections
        });
      }

      let hashSecret = await this.dconfigsService.getDconfigHashSecret();

      let demoUserEmail = RESTRICTED_USER_EMAIL;
      let demoUserInitialPassword = RESTRICTED_USER_PASSWORD;

      let demoUserEmailHash = this.hashService.makeHash({
        input: demoUserEmail,
        hashSecret: hashSecret
      });

      let demoUser = await this.db.drizzle.query.usersTable
        .findFirst({
          where: eq(usersTable.emailHash, demoUserEmailHash)
        })
        .then(x => this.tabService.userEntToTab(x));

      if (isUndefined(demoUser)) {
        demoUser = await this.usersService.addDemoUser({
          email: demoUserEmail,
          password: demoUserInitialPassword
        });

        await this.membersService.addDemoMemberToDemoProject({
          user: demoUser
        });
      }
    }
  }

  async addDemoConnections(item: { demoProjectId: string }) {
    let { demoProjectId } = item;

    let connections: ConnectionTab[] = [];

    let c1connection = await this.db.drizzle.query.connectionsTable.findFirst({
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
      isUndefined(c1connection) &&
      isDefinedAndNotEmpty(demoProjectDwhPostgresPassword)
    ) {
      let c1 = this.connectionsService.makeConnection({
        projectId: demoProjectId,
        envId: PROJECT_ENV_PROD,
        connectionId: 'c1_postgres',
        type: ConnectionTypeEnum.PostgreSQL,
        options: {
          postgres: {
            host: this.cs.get<BackendConfig['demoProjectDwhPostgresHost']>(
              'demoProjectDwhPostgresHost'
            ),
            port: 5436,
            database: 'p_db',
            username: 'postgres',
            password: demoProjectDwhPostgresPassword,
            isSSL: false
          }
        }
      });

      connections.push(c1);
    }

    // let c2connection =
    //   await this.db.drizzle.query.connectionsTable.findFirst({
    //     where: and(
    //       eq(connectionsTable.projectId, demoProjectId),
    //       eq(connectionsTable.envId, PROJECT_ENV_PROD),
    //       eq(connectionsTable.connectionId, 'c2_clickhouse')
    //     )
    //   });

    // let demoProjectDwhClickhousePassword = this.cs.get<
    //   BackendConfig['demoProjectDwhClickhousePassword']
    // >('demoProjectDwhClickhousePassword');

    // if (
    //   isUndefined(c2connection) &&
    //   isDefinedAndNotEmpty(demoProjectDwhClickhousePassword)
    // ) {
    //   let c2 = this.makerService.makeConnection({
    //     projectId: demoProjectId,
    //     envId: PROJECT_ENV_PROD,
    //     connectionId: 'c2_clickhouse',
    //     type: ConnectionTypeEnum.ClickHouse,
    //     options: {
    //       clickhouse: {
    //         host: 'dwh-clickhouse',
    //         port: 8123,
    //         username: 'c_user',
    //         password: demoProjectDwhClickhousePassword,
    //         isSSL: false
    //       }
    //     }
    //   });

    //   connections.push(c2);
    // }

    let c3connection = await this.db.drizzle.query.connectionsTable.findFirst({
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
      isUndefined(c3connection) &&
      isDefinedAndNotEmpty(demoProjectDwhBigqueryCredentialsPath)
    ) {
      let bigqueryTestCredentials = JSON.parse(
        fse.readFileSync(demoProjectDwhBigqueryCredentialsPath).toString()
      );

      let c3 = this.connectionsService.makeConnection({
        projectId: demoProjectId,
        envId: PROJECT_ENV_PROD,
        connectionId: 'c3_bigquery',
        type: ConnectionTypeEnum.BigQuery,
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

    let c4connection = await this.db.drizzle.query.connectionsTable.findFirst({
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
      isUndefined(c4connection) &&
      isDefinedAndNotEmpty(demoProjectDwhSnowflakeAccount)
    ) {
      let c4 = this.connectionsService.makeConnection({
        projectId: demoProjectId,
        envId: PROJECT_ENV_PROD,
        connectionId: 'c4_snowflake',
        type: ConnectionTypeEnum.SnowFlake,
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

    let c5connection = await this.db.drizzle.query.connectionsTable.findFirst({
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
      isUndefined(c5connection) &&
      isDefinedAndNotEmpty(demoProjectDwhMotherDuckToken)
    ) {
      let c5 = this.connectionsService.makeConnection({
        projectId: demoProjectId,
        envId: PROJECT_ENV_PROD,
        connectionId: 'c5_duckdb',
        type: ConnectionTypeEnum.MotherDuck,
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

    let c6connection = await this.db.drizzle.query.connectionsTable.findFirst({
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
      isUndefined(c6connection) &&
      isDefinedAndNotEmpty(demoProjectDwhMysqlPassword)
    ) {
      let c6 = this.connectionsService.makeConnection({
        projectId: demoProjectId,
        envId: PROJECT_ENV_PROD,
        connectionId: 'c6_mysql',
        type: ConnectionTypeEnum.MySQL,
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

    let c7connection = await this.db.drizzle.query.connectionsTable.findFirst({
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
      isUndefined(c7connection) &&
      isDefinedAndNotEmpty(demoProjectDwhGoogleApiCredentialsPath)
    ) {
      let googleApiTestCredentials = JSON.parse(
        fse.readFileSync(demoProjectDwhGoogleApiCredentialsPath).toString()
      );

      let c7 = this.connectionsService.makeConnection({
        projectId: demoProjectId,
        envId: PROJECT_ENV_PROD,
        connectionId: 'c7_google',
        type: ConnectionTypeEnum.GoogleApi,
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

    let c8connection = await this.db.drizzle.query.connectionsTable.findFirst({
      where: and(
        eq(connectionsTable.projectId, demoProjectId),
        eq(connectionsTable.envId, PROJECT_ENV_PROD),
        eq(connectionsTable.connectionId, 'c8_trino')
      )
    });

    let demoProjectDwhTrinoUser = this.cs.get<
      BackendConfig['demoProjectDwhTrinoUser']
    >('demoProjectDwhTrinoUser');

    if (
      isUndefined(c8connection) &&
      isDefinedAndNotEmpty(demoProjectDwhTrinoUser)
    ) {
      let c8 = this.connectionsService.makeConnection({
        projectId: demoProjectId,
        envId: PROJECT_ENV_PROD,
        connectionId: 'c8_trino',
        type: ConnectionTypeEnum.Trino,
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

    let c9connection = await this.db.drizzle.query.connectionsTable.findFirst({
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
      isUndefined(c9connection) &&
      isDefinedAndNotEmpty(demoProjectDwhPrestoUser)
    ) {
      let c9 = this.connectionsService.makeConnection({
        projectId: demoProjectId,
        envId: PROJECT_ENV_PROD,
        connectionId: 'c9_presto',
        type: ConnectionTypeEnum.Presto,
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

    await retry(
      async () =>
        await this.db.drizzle.transaction(
          async tx =>
            await this.db.packer.write({
              tx: tx,
              insert: {
                connections: connections
              }
            })
        ),
      getRetryOption(this.cs, this.logger)
    );

    return connections;
  }
}
