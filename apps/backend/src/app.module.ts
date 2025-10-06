import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { MailerModule } from '@nestjs-modules/mailer';
import { Inject, Logger, Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, seconds } from '@nestjs/throttler';
import { DefaultLogger, and, eq } from 'drizzle-orm';
import {
  NodePgDatabase,
  drizzle as drizzlePg
} from 'drizzle-orm/node-postgres';
import { migrate as migratePg } from 'drizzle-orm/node-postgres/migrator';
import * as fse from 'fs-extra';
import Redis from 'ioredis';
import { Client, ClientConfig } from 'pg';
import { BackendConfig } from '~backend/config/backend-config';
import { DEMO_ORG_NAME, PROJECT_ENV_PROD } from '~common/constants/top';
import { BoolEnum } from '~common/enums/bool.enum';
import { ConnectionTypeEnum } from '~common/enums/connection-type.enum';
import { BackendEnvEnum } from '~common/enums/env/backend-env.enum';
import { LogLevelEnum } from '~common/enums/log-level.enum';
import { RabbitExchangesEnum } from '~common/enums/rabbit-exchanges.enum';
import { isDefined } from '~common/functions/is-defined';
import { isDefinedAndNotEmpty } from '~common/functions/is-defined-and-not-empty';
import { isUndefined } from '~common/functions/is-undefined';
import { makeId } from '~common/functions/make-id';
import { Ev } from '~common/interfaces/backend/ev';
import { UserTab } from '~common/interfaces/backend/user-tab';
import { appControllers } from './app-controllers';
import { AppFilter } from './app-filter';
import { AppInterceptor } from './app-interceptor';
import { appProviders } from './app-providers';
import { getConfig } from './config/get.config';
import { DrizzleLogWriter } from './drizzle/drizzle-log-writer';
import { DRIZZLE, Db, DrizzleModule } from './drizzle/drizzle.module';
import { schemaPostgres } from './drizzle/postgres/schema/_schema-postgres';
import {
  ConnectionEnt,
  connectionsTable
} from './drizzle/postgres/schema/connections';
import { orgsTable } from './drizzle/postgres/schema/orgs';
import { projectsTable } from './drizzle/postgres/schema/projects';
import { UserEnt, usersTable } from './drizzle/postgres/schema/users';
import { getRetryOption } from './functions/get-retry-option';
import { isScheduler } from './functions/is-scheduler';
import { logToConsoleBackend } from './functions/log-to-console-backend';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { HashService } from './services/hash.service';
import { EntMakerService } from './services/maker.service';
import { OrgsService } from './services/orgs.service';
import { ProjectsService } from './services/projects.service';
import { TabService } from './services/tab.service';
import { UsersService } from './services/users.service';
import { WrapToApiService } from './services/wrap-to-api.service';

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

let mailerModule = MailerModule.forRootAsync({
  inject: [ConfigService],
  useFactory: (cs: ConfigService<BackendConfig>) => {
    let transport;

    // let emailTransport =
    //   cs.get<BackendConfig['emailTransport']>('emailTransport');

    transport = {
      host: cs.get<BackendConfig['smtpHost']>('smtpHost'),
      port: cs.get<BackendConfig['smtpPort']>('smtpPort'),
      secure:
        cs.get<BackendConfig['smtpSecure']>('smtpSecure') === BoolEnum.TRUE
          ? true
          : false,
      auth: {
        user: cs.get<BackendConfig['smtpAuthUser']>('smtpAuthUser'),
        pass: cs.get<BackendConfig['smtpAuthPassword']>('smtpAuthPassword')
      }
    };

    let fromName =
      cs.get<BackendConfig['sendEmailFromName']>('sendEmailFromName');

    let fromAddress = cs.get<BackendConfig['sendEmailFromAddress']>(
      'sendEmailFromAddress'
    );

    return {
      transport: transport,
      defaults: {
        from: `"${fromName}" <${fromAddress}>`
      }
      // template: {
      //   dir: __dirname + '/templates',
      //   adapter: new EjsAdapter(),
      //   options: {
      //     strict: true
      //   }
      // }
    };
  }
});

let customThrottlerModule = ThrottlerModule.forRootAsync({
  inject: [ConfigService],
  useFactory: (cs: ConfigService<BackendConfig>) => {
    let redisHost =
      cs.get<BackendConfig['backendRedisHost']>('backendRedisHost');

    let redisPassword = cs.get<BackendConfig['backendRedisPassword']>(
      'backendRedisPassword'
    );

    // the same as apps/backend/src/services/redis.service.ts
    let redisClient = new Redis({
      host: redisHost,
      port: 6379,
      password: redisPassword
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
          limit: 10 * 2
        },
        {
          name: '5s',
          ttl: seconds(5),
          blockDuration: seconds(5),
          limit: 20 * 2
        },
        {
          name: '60s',
          ttl: seconds(60),
          blockDuration: seconds(60),
          limit: 100 * 2
        },
        {
          name: '600s',
          ttl: seconds(600),
          blockDuration: seconds(12 * 60 * 60), // 12h
          limit: 300 * 2
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
    mailerModule,
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
    private wrapToApiService: WrapToApiService,
    private usersService: UsersService,
    private orgsService: OrgsService,
    private projectsService: ProjectsService,
    private entMakerService: EntMakerService,
    private hashService: HashService,
    private tabService: TabService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  async onModuleInit() {
    try {
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

      if (isScheduler(this.cs)) {
        // Drizzle

        let clientConfig: ClientConfig = {
          connectionString: this.cs.get<
            BackendConfig['backendPostgresDatabaseUrl']
          >('backendPostgresDatabaseUrl'),
          ssl:
            this.cs.get<BackendConfig['backendIsPostgresTls']>(
              'backendIsPostgresTls'
            ) === BoolEnum.TRUE
              ? {
                  rejectUnauthorized: false
                }
              : false
        };

        let postgresSingleClient = new Client(clientConfig);

        await postgresSingleClient.connect();

        let isLogDrizzlePostgres =
          this.cs.get<BackendConfig['backendLogDrizzlePostgres']>(
            'backendLogDrizzlePostgres'
          ) === BoolEnum.TRUE;

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

        //

        let mproveAdminEmail =
          this.cs.get<BackendConfig['mproveAdminEmail']>('mproveAdminEmail');

        let mproveAdminInitialPassword = this.cs.get<
          BackendConfig['mproveAdminInitialPassword']
        >('mproveAdminInitialPassword');

        let mproveAdminUser: UserEnt;

        if (
          isDefinedAndNotEmpty(mproveAdminEmail) &&
          isDefinedAndNotEmpty(mproveAdminInitialPassword)
        ) {
          let mproveAdminEmailHash =
            this.hashService.makeHash(mproveAdminEmail);

          mproveAdminUser = await this.db.drizzle.query.usersTable.findFirst({
            where: eq(usersTable.emailHash, mproveAdminEmailHash)
          });

          if (isUndefined(mproveAdminUser)) {
            mproveAdminUser = await this.usersService.addMproveAdminUser({
              email: mproveAdminEmail,
              password: mproveAdminInitialPassword
            });
          }
        }

        let demoOrgId = this.cs.get<BackendConfig['demoOrgId']>('demoOrgId');

        let demoProjectId =
          this.cs.get<BackendConfig['demoProjectId']>('demoProjectId');

        let demoProjectName =
          this.cs.get<BackendConfig['demoProjectName']>('demoProjectName');

        let seedDemoOrgAndProject = this.cs.get<
          BackendConfig['seedDemoOrgAndProject']
        >('seedDemoOrgAndProject');

        if (
          seedDemoOrgAndProject === BoolEnum.TRUE &&
          isDefined(mproveAdminUser) &&
          isDefinedAndNotEmpty(demoOrgId) &&
          isDefinedAndNotEmpty(demoProjectId)
        ) {
          let firstOrg = await this.db.drizzle.query.orgsTable.findFirst({
            where: eq(orgsTable.orgId, demoOrgId)
          });

          if (isUndefined(firstOrg)) {
            let mproveAdminUserTab = this.tabService.decryptData<UserTab>({
              encryptedString: mproveAdminUser.tab
            });

            firstOrg = await this.orgsService.addOrg({
              ownerId: mproveAdminUser.userId,
              ownerEmail: mproveAdminUserTab.email,
              name: DEMO_ORG_NAME,
              traceId: makeId(),
              orgId: demoOrgId
            });
          }

          let connections: ConnectionEnt[] = [];

          let c1connection =
            await this.db.drizzle.query.connectionsTable.findFirst({
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
            let c1 = this.entMakerService.makeConnection({
              projectId: demoProjectId,
              envId: PROJECT_ENV_PROD,
              connectionId: 'c1_postgres',
              type: ConnectionTypeEnum.PostgreSQL,
              options: {
                postgres: {
                  host: this.cs.get<
                    BackendConfig['demoProjectDwhPostgresHost']
                  >('demoProjectDwhPostgresHost'),
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

          let c3connection =
            await this.db.drizzle.query.connectionsTable.findFirst({
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

            let c3 = this.entMakerService.makeConnection({
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

          let c4connection =
            await this.db.drizzle.query.connectionsTable.findFirst({
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
            let c4 = this.entMakerService.makeConnection({
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

          let c5connection =
            await this.db.drizzle.query.connectionsTable.findFirst({
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
            let c5 = this.entMakerService.makeConnection({
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

          let c6connection =
            await this.db.drizzle.query.connectionsTable.findFirst({
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
            let c6 = this.entMakerService.makeConnection({
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
                  database: this.cs.get<
                    BackendConfig['demoProjectDwhMysqlDatabase']
                  >('demoProjectDwhMysqlDatabase'),
                  user: this.cs.get<BackendConfig['demoProjectDwhMysqlUser']>(
                    'demoProjectDwhMysqlUser'
                  ),
                  password: demoProjectDwhMysqlPassword
                }
              }
            });

            connections.push(c6);
          }

          let c7connection =
            await this.db.drizzle.query.connectionsTable.findFirst({
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
              fse
                .readFileSync(demoProjectDwhGoogleApiCredentialsPath)
                .toString()
            );

            let c7 = this.entMakerService.makeConnection({
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
                  googleCloudClientEmail:
                    googleApiTestCredentials?.client_email,
                  googleAccessToken: undefined
                }
              }
            });

            connections.push(c7);
          }

          let c8connection =
            await this.db.drizzle.query.connectionsTable.findFirst({
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
            let c8 = this.entMakerService.makeConnection({
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
                  password: this.cs.get<
                    BackendConfig['demoProjectDwhTrinoPassword']
                  >('demoProjectDwhTrinoPassword'),
                  extraConfig: undefined
                }
              }
            });

            connections.push(c8);
          }

          let c9connection =
            await this.db.drizzle.query.connectionsTable.findFirst({
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
            let c9 = this.entMakerService.makeConnection({
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

          let demoProject = await this.db.drizzle.query.projectsTable.findFirst(
            {
              where: eq(projectsTable.projectId, demoProjectId)
            }
          );

          if (isUndefined(demoProject)) {
            let demoProjectRemoteType = this.cs.get<
              BackendConfig['demoProjectRemoteType']
            >('demoProjectRemoteType');

            let demoProjectRemoteGitUrl = this.cs.get<
              BackendConfig['demoProjectRemoteGitUrl']
            >('demoProjectRemoteGitUrl');

            let demoProjectRemotePrivateKeyPath = this.cs.get<
              BackendConfig['demoProjectRemotePrivateKeyPath']
            >('demoProjectRemotePrivateKeyPath');

            let demoProjectRemotePublicKeyPath = this.cs.get<
              BackendConfig['demoProjectRemotePublicKeyPath']
            >('demoProjectRemotePublicKeyPath');

            let privateKey;
            let publicKey;

            if (
              isDefinedAndNotEmpty(demoProjectRemotePrivateKeyPath) &&
              isDefinedAndNotEmpty(demoProjectRemotePublicKeyPath)
            ) {
              privateKey = fse
                .readFileSync(demoProjectRemotePrivateKeyPath)
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
              orgId: firstOrg.orgId,
              name: demoProjectName,
              user: mproveAdminUser,
              traceId: makeId(),
              projectId: demoProjectId,
              testProjectId: 'demo-project',
              remoteType: demoProjectRemoteType,
              gitUrl: demoProjectRemoteGitUrl,
              privateKey: privateKey,
              publicKey: publicKey,
              evs: [ev1],
              connections: connections.map(x =>
                this.wrapToApiService.wrapToApiConnection({
                  connection: x,
                  isIncludePasswords: true
                })
              )
            });
          }
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
  }
}
