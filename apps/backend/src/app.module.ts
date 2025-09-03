import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { MailerModule } from '@nestjs-modules/mailer';
import { Inject, Logger, Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ScheduleModule } from '@nestjs/schedule';
import { DefaultLogger, and, eq } from 'drizzle-orm';
import {
  NodePgDatabase,
  drizzle as drizzlePg
} from 'drizzle-orm/node-postgres';
import { migrate as migratePg } from 'drizzle-orm/node-postgres/migrator';
import * as fse from 'fs-extra';
import { Client, ClientConfig } from 'pg';
import { BackendConfig } from '~backend/config/backend-config';
import { FIRST_ORG_NAME, PROJECT_ENV_PROD } from '~common/constants/top';
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
import { ProjectConnection } from '~common/interfaces/blockml/project-connection';
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
import { MakerService } from './services/maker.service';
import { OrgsService } from './services/orgs.service';
import { ProjectsService } from './services/projects.service';
import { UsersService } from './services/users.service';

let retry = require('async-retry');

let configModule = ConfigModule.forRoot({
  load: [getConfig],
  isGlobal: true
});

let jwtModule = JwtModule.registerAsync({
  useFactory: async (cs: ConfigService<BackendConfig>) => ({
    secret: cs.get<BackendConfig['jwtSecret']>('jwtSecret'),
    signOptions: { expiresIn: '30d' }
  }),
  inject: [ConfigService]
});

let rabbitModule = RabbitMQModule.forRootAsync(RabbitMQModule, {
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
  },
  inject: [ConfigService]
});

let mailerModule = MailerModule.forRootAsync({
  useFactory: (cs: ConfigService<BackendConfig>) => {
    let transport;

    let emailTransport =
      cs.get<BackendConfig['emailTransport']>('emailTransport');

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
  },
  inject: [ConfigService]
});

@Module({
  imports: [
    configModule,
    ScheduleModule.forRoot(),
    jwtModule,
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
    private usersService: UsersService,
    private orgsService: OrgsService,
    private projectsService: ProjectsService,
    private makerService: MakerService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  async onModuleInit() {
    try {
      logToConsoleBackend({
        log: `NODE_ENV is set to "${process.env.NODE_ENV}"`,
        logLevel: LogLevelEnum.Info,
        logger: this.logger,
        cs: this.cs
      });

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

        let email =
          this.cs.get<BackendConfig['firstUserEmail']>('firstUserEmail');

        let password =
          this.cs.get<BackendConfig['firstUserPassword']>('firstUserPassword');

        let firstUser: UserEnt;

        if (isDefinedAndNotEmpty(email) && isDefinedAndNotEmpty(password)) {
          firstUser = await this.db.drizzle.query.usersTable.findFirst({
            where: eq(usersTable.email, email)
          });

          if (isUndefined(firstUser)) {
            firstUser = await this.usersService.addFirstUser({
              email: email,
              password: password
            });
          }
        }

        let firstOrgId = this.cs.get<BackendConfig['firstOrgId']>('firstOrgId');

        let firstProjectId =
          this.cs.get<BackendConfig['firstProjectId']>('firstProjectId');

        let firstProjectName =
          this.cs.get<BackendConfig['firstProjectName']>('firstProjectName');

        let firstProjectSeedConnections = this.cs.get<
          BackendConfig['firstProjectSeedConnections']
        >('firstProjectSeedConnections');

        let firstOrg;

        if (
          isDefined(firstUser) &&
          isDefinedAndNotEmpty(firstOrgId) &&
          isDefinedAndNotEmpty(firstProjectId)
        ) {
          firstOrg = await this.db.drizzle.query.orgsTable.findFirst({
            where: eq(orgsTable.orgId, firstOrgId)
          });

          if (isUndefined(firstOrg)) {
            firstOrg = await this.orgsService.addOrg({
              ownerId: firstUser.userId,
              ownerEmail: firstUser.email,
              name: FIRST_ORG_NAME,
              traceId: makeId(),
              orgId: firstOrgId
            });
          }

          let connections: ConnectionEnt[] = [];

          if (firstProjectSeedConnections === BoolEnum.TRUE) {
            let c1connection =
              await this.db.drizzle.query.connectionsTable.findFirst({
                where: and(
                  eq(connectionsTable.projectId, firstProjectId),
                  eq(connectionsTable.envId, PROJECT_ENV_PROD),
                  eq(connectionsTable.connectionId, 'c1_postgres')
                )
              });

            if (isUndefined(c1connection)) {
              let c1 = this.makerService.makeConnection({
                projectId: firstProjectId,
                envId: PROJECT_ENV_PROD,
                connectionId: 'c1_postgres',
                type: ConnectionTypeEnum.PostgreSQL,
                baseUrl: undefined,
                headers: undefined,
                googleAuthScopes: undefined,
                host: this.cs.get<BackendConfig['firstProjectDwhPostgresHost']>(
                  'firstProjectDwhPostgresHost'
                ),
                port: 5436,
                database: 'p_db',
                username: 'postgres',
                password: this.cs.get<
                  BackendConfig['firstProjectDwhPostgresPassword']
                >('firstProjectDwhPostgresPassword'),
                account: undefined,
                warehouse: undefined,
                serviceAccountCredentials: undefined,
                bigqueryQuerySizeLimitGb: 1,
                isSSL: false
              });

              connections.push(c1);
            }

            let c2connection =
              await this.db.drizzle.query.connectionsTable.findFirst({
                where: and(
                  eq(connectionsTable.projectId, firstProjectId),
                  eq(connectionsTable.envId, PROJECT_ENV_PROD),
                  eq(connectionsTable.connectionId, 'c2_clickhouse')
                )
              });

            if (isUndefined(c2connection)) {
              let c2 = this.makerService.makeConnection({
                projectId: firstProjectId,
                envId: PROJECT_ENV_PROD,
                connectionId: 'c2_clickhouse',
                type: ConnectionTypeEnum.ClickHouse,
                baseUrl: undefined,
                headers: undefined,
                googleAuthScopes: undefined,
                host: 'dwh-clickhouse',
                port: 8123,
                username: 'c_user',
                password: this.cs.get<
                  BackendConfig['firstProjectDwhClickhousePassword']
                >('firstProjectDwhClickhousePassword'),
                database: undefined,
                account: undefined,
                warehouse: undefined,
                serviceAccountCredentials: undefined,
                bigqueryQuerySizeLimitGb: 1,
                isSSL: false
              });

              connections.push(c2);
            }

            let c3connection =
              await this.db.drizzle.query.connectionsTable.findFirst({
                where: and(
                  eq(connectionsTable.projectId, firstProjectId),
                  eq(connectionsTable.envId, PROJECT_ENV_PROD),
                  eq(connectionsTable.connectionId, 'c3_bigquery')
                )
              });

            if (isUndefined(c3connection)) {
              let firstProjectDwhBigqueryCredentialsPath = this.cs.get<
                BackendConfig['firstProjectDwhBigqueryCredentialsPath']
              >('firstProjectDwhBigqueryCredentialsPath');

              let bigqueryTestCredentials = JSON.parse(
                fse
                  .readFileSync(firstProjectDwhBigqueryCredentialsPath)
                  .toString()
              );

              let c3 = this.makerService.makeConnection({
                projectId: firstProjectId,
                envId: PROJECT_ENV_PROD,
                connectionId: 'c3_bigquery',
                type: ConnectionTypeEnum.BigQuery,
                baseUrl: undefined,
                headers: undefined,
                googleAuthScopes: undefined,
                host: undefined,
                port: undefined,
                database: undefined,
                username: undefined,
                password: undefined,
                account: undefined,
                warehouse: undefined,
                serviceAccountCredentials: bigqueryTestCredentials,
                bigqueryQuerySizeLimitGb: 1,
                isSSL: true
              });

              connections.push(c3);
            }

            let c4connection =
              await this.db.drizzle.query.connectionsTable.findFirst({
                where: and(
                  eq(connectionsTable.projectId, firstProjectId),
                  eq(connectionsTable.envId, PROJECT_ENV_PROD),
                  eq(connectionsTable.connectionId, 'c4_snowflake')
                )
              });

            if (isUndefined(c4connection)) {
              let c4 = this.makerService.makeConnection({
                projectId: firstProjectId,
                envId: PROJECT_ENV_PROD,
                connectionId: 'c4_snowflake',
                type: ConnectionTypeEnum.SnowFlake,
                baseUrl: undefined,
                headers: undefined,
                googleAuthScopes: undefined,
                host: undefined,
                port: undefined,
                database: undefined,
                username: this.cs.get<
                  BackendConfig['firstProjectDwhSnowflakeUsername']
                >('firstProjectDwhSnowflakeUsername'),
                password: this.cs.get<
                  BackendConfig['firstProjectDwhSnowflakePassword']
                >('firstProjectDwhSnowflakePassword'),
                account: this.cs.get<
                  BackendConfig['firstProjectDwhSnowflakeAccount']
                >('firstProjectDwhSnowflakeAccount'),
                warehouse: this.cs.get<
                  BackendConfig['firstProjectDwhSnowflakeWarehouse']
                >('firstProjectDwhSnowflakeWarehouse'),
                serviceAccountCredentials: undefined,
                bigqueryQuerySizeLimitGb: 1,
                isSSL: true
              });

              connections.push(c4);
            }
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

          let firstProject =
            await this.db.drizzle.query.projectsTable.findFirst({
              where: eq(projectsTable.projectId, firstProjectId)
            });

          if (isUndefined(firstProject)) {
            let firstProjectRemoteType = this.cs.get<
              BackendConfig['firstProjectRemoteType']
            >('firstProjectRemoteType');

            let firstProjectRemoteGitUrl = this.cs.get<
              BackendConfig['firstProjectRemoteGitUrl']
            >('firstProjectRemoteGitUrl');

            let firstProjectRemotePrivateKeyPath = this.cs.get<
              BackendConfig['firstProjectRemotePrivateKeyPath']
            >('firstProjectRemotePrivateKeyPath');

            let firstProjectRemotePublicKeyPath = this.cs.get<
              BackendConfig['firstProjectRemotePublicKeyPath']
            >('firstProjectRemotePublicKeyPath');

            let privateKey;
            let publicKey;

            if (
              isDefinedAndNotEmpty(firstProjectRemotePrivateKeyPath) &&
              isDefinedAndNotEmpty(firstProjectRemotePublicKeyPath)
            ) {
              privateKey = fse
                .readFileSync(firstProjectRemotePrivateKeyPath)
                .toString();

              publicKey = fse
                .readFileSync(firstProjectRemotePublicKeyPath)
                .toString();
            }

            let ev1: Ev = {
              evId: 'MPROVE_SNOWFLAKE_DATABASE',
              val: 's_db'
            };

            firstProject = await this.projectsService.addProject({
              orgId: firstOrg.orgId,
              name: firstProjectName,
              user: firstUser,
              traceId: makeId(),
              projectId: firstProjectId,
              testProjectId: 'first-project',
              remoteType: firstProjectRemoteType,
              gitUrl: firstProjectRemoteGitUrl,
              privateKey: privateKey,
              publicKey: publicKey,
              evs: [ev1],
              connections: connections.map(
                x =>
                  <ProjectConnection>{
                    connectionId: x.connectionId,
                    type: x.type,
                    googleCloudProject: x.googleCloudProject,
                    host: x.host,
                    port: x.port,
                    username: x.username,
                    password: x.password,
                    databaseName: x.database
                  }
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
