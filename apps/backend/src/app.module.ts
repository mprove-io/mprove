import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { MailerModule } from '@nestjs-modules/mailer';
import { Inject, Logger, Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DefaultLogger } from 'drizzle-orm';
import {
  NodePgDatabase,
  drizzle as drizzlePg
} from 'drizzle-orm/node-postgres';
import { migrate as migratePg } from 'drizzle-orm/node-postgres/migrator';
import * as fse from 'fs-extra';
import * as mg from 'nodemailer-mailgun-transport';
import { Client, ClientConfig } from 'pg';
import { DataSource } from 'typeorm';
import { appControllers } from './app-controllers';
import { appEntities } from './app-entities';
import { AppFilter } from './app-filter';
import { AppInterceptor } from './app-interceptor';
import { appMigrations } from './app-migrations';
import { appProviders } from './app-providers';
import { appRepositories } from './app-repositories';
import { common } from './barrels/common';
import { enums } from './barrels/enums';
import { helper } from './barrels/helper';
import { interfaces } from './barrels/interfaces';
import { maker } from './barrels/maker';
import { repositories } from './barrels/repositories';
import { schemaPostgres } from './barrels/schema-postgres';
import { getConfig } from './config/get.config';
import { DrizzleLogWriter } from './drizzle/drizzle-log-writer';
import { DRIZZLE, Db, DrizzleModule } from './drizzle/drizzle.module';
import { logToConsoleBackend } from './functions/log-to-console-backend';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { DbService } from './services/db.service';
import { OrgsService } from './services/orgs.service';
import { ProjectsService } from './services/projects.service';
import { UsersService } from './services/users.service';

let configModule = ConfigModule.forRoot({
  load: [getConfig],
  isGlobal: true
});

let jwtModule = JwtModule.registerAsync({
  useFactory: async (cs: ConfigService<interfaces.Config>) => ({
    secret: cs.get<interfaces.Config['jwtSecret']>('jwtSecret'),
    signOptions: { expiresIn: '30d' }
  }),
  inject: [ConfigService]
});

let rabbitModule = RabbitMQModule.forRootAsync(RabbitMQModule, {
  useFactory: (cs: ConfigService<interfaces.Config>) => {
    let rabbitUser =
      cs.get<interfaces.Config['backendRabbitUser']>('backendRabbitUser');
    let rabbitPass =
      cs.get<interfaces.Config['backendRabbitPass']>('backendRabbitPass');
    let rabbitHost =
      cs.get<interfaces.Config['backendRabbitHost']>('backendRabbitHost');
    let rabbitPort =
      cs.get<interfaces.Config['backendRabbitPort']>('backendRabbitPort');
    let rabbitProtocol = cs.get<interfaces.Config['backendRabbitProtocol']>(
      'backendRabbitProtocol'
    );

    let backendEnv = cs.get<interfaces.Config['backendEnv']>('backendEnv');

    return {
      exchanges: [
        {
          name: common.RabbitExchangesEnum.Blockml.toString(),
          type: 'direct'
        },
        {
          name: common.RabbitExchangesEnum.Disk.toString(),
          type: 'direct'
        }
      ],
      uri: [
        `${rabbitProtocol}://${rabbitUser}:${rabbitPass}@${rabbitHost}:${rabbitPort}`
      ],
      connectionInitOptions: {
        // wait for connection on startup, but do not recover when connection lost
        wait: backendEnv === enums.BackendEnvEnum.TEST ? true : false,
        timeout: backendEnv === enums.BackendEnvEnum.TEST ? 75000 : undefined
      },
      connectionManagerOptions: {
        connectionOptions: { rejectUnauthorized: false }
      }
    };
  },
  inject: [ConfigService]
});

let typeormRootModule = TypeOrmModule.forRootAsync({
  useFactory: (cs: ConfigService<interfaces.Config>) => ({
    type: 'mysql',
    host: cs.get<interfaces.Config['backendMysqlHost']>('backendMysqlHost'),
    port: cs.get<interfaces.Config['backendMysqlPort']>('backendMysqlPort'),
    username: cs.get<interfaces.Config['backendMysqlUsername']>(
      'backendMysqlUsername'
    ),
    password: cs.get<interfaces.Config['backendMysqlPassword']>(
      'backendMysqlPassword'
    ),
    database: cs.get<interfaces.Config['backendMysqlDatabase']>(
      'backendMysqlDatabase'
    ),
    entities: appEntities,
    migrations: appMigrations
  }),
  inject: [ConfigService]
});

let typeormFeatureModule = TypeOrmModule.forFeature([...appEntities]);

let mailerModule = MailerModule.forRootAsync({
  useFactory: (cs: ConfigService<interfaces.Config>) => {
    let transport;

    let emailTransport =
      cs.get<interfaces.Config['emailTransport']>('emailTransport');

    if (emailTransport === enums.EmailTransportEnum.MAILGUN) {
      transport = mg({
        auth: {
          api_key: cs.get<interfaces.Config['mailgunActiveApiKey']>(
            'mailgunActiveApiKey'
          ),
          domain: cs.get<interfaces.Config['mailgunDomain']>('mailgunDomain')
        }
      });
    } else {
      transport = {
        host: cs.get<interfaces.Config['smtpHost']>('smtpHost'),
        port: cs.get<interfaces.Config['smtpPort']>('smtpPort'),
        secure:
          cs.get<interfaces.Config['smtpSecure']>('smtpSecure') ===
          common.BoolEnum.TRUE
            ? true
            : false,
        auth: {
          user: cs.get<interfaces.Config['smtpAuthUser']>('smtpAuthUser'),
          pass: cs.get<interfaces.Config['smtpAuthPassword']>(
            'smtpAuthPassword'
          )
        }
      };
    }

    let fromName =
      cs.get<interfaces.Config['sendEmailFromName']>('sendEmailFromName');

    let fromAddress = cs.get<interfaces.Config['sendEmailFromAddress']>(
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
    DrizzleModule,
    typeormRootModule,
    typeormFeatureModule
  ],
  controllers: appControllers,
  providers: [
    Logger,
    ...appProviders,
    ...appRepositories,
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
    private dataSource: DataSource,
    private usersService: UsersService,
    private orgsService: OrgsService,
    private projectsService: ProjectsService,
    private cs: ConfigService<interfaces.Config>,
    private usersRepository: repositories.UsersRepository,
    private orgsRepository: repositories.OrgsRepository,
    private projectsRepository: repositories.ProjectsRepository,
    private connectionsRepository: repositories.ConnectionsRepository,
    private evsRepository: repositories.EvsRepository,
    private dbService: DbService,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  async onModuleInit() {
    try {
      logToConsoleBackend({
        log: `NODE_ENV is set to "${process.env.NODE_ENV}"`,
        logLevel: common.LogLevelEnum.Info,
        logger: this.logger,
        cs: this.cs
      });

      if (helper.isScheduler(this.cs)) {
        // Typeorm

        const migrationsPending = await this.dataSource.showMigrations();

        if (migrationsPending) {
          const migrations = await this.dataSource.runMigrations({
            transaction: 'all'
          });
          migrations.forEach(migration => {
            logToConsoleBackend({
              log: `Typeorm Migration ${migration.name} success`,
              logLevel: common.LogLevelEnum.Info,
              logger: this.logger,
              cs: this.cs
            });
          });
        } else {
          logToConsoleBackend({
            log: 'Typeorm No migrations pending',
            logLevel: common.LogLevelEnum.Info,
            logger: this.logger,
            cs: this.cs
          });
        }

        // Drizzle

        let clientConfig: ClientConfig = {
          connectionString: this.cs.get<
            interfaces.Config['backendPostgresDatabaseUrl']
          >('backendPostgresDatabaseUrl'),
          ssl:
            this.cs.get<interfaces.Config['backendIsPostgresTls']>(
              'backendIsPostgresTls'
            ) === common.BoolEnum.TRUE
              ? {
                  rejectUnauthorized: false
                }
              : false
        };

        let postgresSingleClient = new Client(clientConfig);

        await postgresSingleClient.connect();

        let isLogDrizzlePostgres =
          this.cs.get<interfaces.Config['backendLogDrizzlePostgres']>(
            'backendLogDrizzlePostgres'
          ) === common.BoolEnum.TRUE;

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
          this.cs.get<interfaces.Config['firstUserEmail']>('firstUserEmail');

        let password =
          this.cs.get<interfaces.Config['firstUserPassword']>(
            'firstUserPassword'
          );

        let firstUser: any;

        if (
          common.isDefinedAndNotEmpty(email) &&
          common.isDefinedAndNotEmpty(password)
        ) {
          firstUser = await this.usersRepository.findOne({
            where: { email: email }
          });

          if (common.isUndefined(firstUser)) {
            firstUser = await this.usersService.addFirstUser({
              email: email,
              password: password
            });
          }
        }

        let firstOrgId =
          this.cs.get<interfaces.Config['firstOrgId']>('firstOrgId');

        let firstProjectId =
          this.cs.get<interfaces.Config['firstProjectId']>('firstProjectId');

        let firstProjectName =
          this.cs.get<interfaces.Config['firstProjectName']>(
            'firstProjectName'
          );

        let firstProjectSeedConnections = this.cs.get<
          interfaces.Config['firstProjectSeedConnections']
        >('firstProjectSeedConnections');

        let firstOrg;

        if (
          common.isDefined(firstUser) &&
          common.isDefinedAndNotEmpty(firstOrgId) &&
          common.isDefinedAndNotEmpty(firstProjectId)
        ) {
          firstOrg = await this.orgsRepository.findOne({
            where: {
              org_id: firstOrgId
            }
          });

          if (common.isUndefined(firstOrg)) {
            firstOrg = await this.orgsService.addOrg({
              ownerId: firstUser.user_id,
              ownerEmail: firstUser.email,
              name: common.FIRST_ORG_NAME,
              traceId: common.makeId(),
              orgId: firstOrgId
            });
          }

          let connections = [];

          if (firstProjectSeedConnections === common.BoolEnum.TRUE) {
            let c1connection = await this.connectionsRepository.findOne({
              where: {
                project_id: firstProjectId,
                connection_id: 'c1_postgres'
              }
            });

            if (common.isUndefined(c1connection)) {
              let c1 = maker.makeConnection({
                projectId: firstProjectId,
                envId: common.PROJECT_ENV_PROD,
                connectionId: 'c1_postgres',
                type: common.ConnectionTypeEnum.PostgreSQL,
                host: this.cs.get<
                  interfaces.Config['firstProjectDwhPostgresHost']
                >('firstProjectDwhPostgresHost'),
                port: 5432,
                database: 'p_db',
                username: 'postgres',
                password: this.cs.get<
                  interfaces.Config['firstProjectDwhPostgresPassword']
                >('firstProjectDwhPostgresPassword'),
                account: undefined,
                warehouse: undefined,
                bigqueryCredentials: undefined,
                bigqueryQuerySizeLimitGb: 1,
                isSSL: false
              });

              connections.push(c1);
            }

            let c2connection = await this.connectionsRepository.findOne({
              where: {
                project_id: firstProjectId,
                connection_id: 'c2_clickhouse'
              }
            });

            if (common.isUndefined(c2connection)) {
              let c2 = maker.makeConnection({
                projectId: firstProjectId,
                envId: common.PROJECT_ENV_PROD,
                connectionId: 'c2_clickhouse',
                type: common.ConnectionTypeEnum.ClickHouse,
                host: 'dwh-clickhouse',
                port: 8123,
                username: 'c_user',
                password: this.cs.get<
                  interfaces.Config['firstProjectDwhClickhousePassword']
                >('firstProjectDwhClickhousePassword'),
                database: undefined,
                account: undefined,
                warehouse: undefined,
                bigqueryCredentials: undefined,
                bigqueryQuerySizeLimitGb: 1,
                isSSL: false
              });

              connections.push(c2);
            }

            let c3connection = await this.connectionsRepository.findOne({
              where: {
                project_id: firstProjectId,
                connection_id: 'c3_bigquery'
              }
            });

            if (common.isUndefined(c3connection)) {
              let firstProjectDwhBigqueryCredentialsPath = this.cs.get<
                interfaces.Config['firstProjectDwhBigqueryCredentialsPath']
              >('firstProjectDwhBigqueryCredentialsPath');

              let bigqueryTestCredentials = JSON.parse(
                fse
                  .readFileSync(firstProjectDwhBigqueryCredentialsPath)
                  .toString()
              );

              let c3 = maker.makeConnection({
                projectId: firstProjectId,
                envId: common.PROJECT_ENV_PROD,
                connectionId: 'c3_bigquery',
                type: common.ConnectionTypeEnum.BigQuery,
                host: undefined,
                port: undefined,
                database: undefined,
                username: undefined,
                password: undefined,
                account: undefined,
                warehouse: undefined,
                bigqueryCredentials: bigqueryTestCredentials,
                bigqueryQuerySizeLimitGb: 1,
                isSSL: true
              });

              connections.push(c3);
            }

            let c4connection = await this.connectionsRepository.findOne({
              where: {
                project_id: firstProjectId,
                connection_id: 'c4_snowflake'
              }
            });

            if (common.isUndefined(c4connection)) {
              let c4 = maker.makeConnection({
                projectId: firstProjectId,
                envId: common.PROJECT_ENV_PROD,
                connectionId: 'c4_snowflake',
                type: common.ConnectionTypeEnum.SnowFlake,
                host: undefined,
                port: undefined,
                database: undefined,
                username: this.cs.get<
                  interfaces.Config['firstProjectDwhSnowflakeUsername']
                >('firstProjectDwhSnowflakeUsername'),
                password: this.cs.get<
                  interfaces.Config['firstProjectDwhSnowflakePassword']
                >('firstProjectDwhSnowflakePassword'),
                account: this.cs.get<
                  interfaces.Config['firstProjectDwhSnowflakeAccount']
                >('firstProjectDwhSnowflakeAccount'),
                warehouse: this.cs.get<
                  interfaces.Config['firstProjectDwhSnowflakeWarehouse']
                >('firstProjectDwhSnowflakeWarehouse'),
                bigqueryCredentials: undefined,
                bigqueryQuerySizeLimitGb: 1,
                isSSL: true
              });

              connections.push(c4);
            }
          }

          let evs = [];

          let ev = await this.evsRepository.findOne({
            where: {
              project_id: firstProjectId,
              env_id: common.PROJECT_ENV_PROD,
              ev_id: 'MPROVE_SNOWFLAKE_DATABASE'
            }
          });

          if (common.isUndefined(ev)) {
            let ev1 = maker.makeEv({
              projectId: firstProjectId,
              envId: common.PROJECT_ENV_PROD,
              evId: 'MPROVE_SNOWFLAKE_DATABASE',
              val: 's_db'
            });

            evs.push(ev1);
          }

          await this.dbService.writeRecords({
            modify: false,
            records: {
              connections: connections,
              evs: evs
            }
          });

          let firstProject = await this.projectsRepository.findOne({
            where: {
              project_id: firstProjectId
            }
          });

          if (common.isUndefined(firstProject)) {
            let firstProjectRemoteType = this.cs.get<
              interfaces.Config['firstProjectRemoteType']
            >('firstProjectRemoteType');

            let firstProjectRemoteGitUrl = this.cs.get<
              interfaces.Config['firstProjectRemoteGitUrl']
            >('firstProjectRemoteGitUrl');

            let firstProjectRemotePrivateKeyPath = this.cs.get<
              interfaces.Config['firstProjectRemotePrivateKeyPath']
            >('firstProjectRemotePrivateKeyPath');

            let firstProjectRemotePublicKeyPath = this.cs.get<
              interfaces.Config['firstProjectRemotePublicKeyPath']
            >('firstProjectRemotePublicKeyPath');

            let privateKey;
            let publicKey;

            if (
              common.isDefinedAndNotEmpty(firstProjectRemotePrivateKeyPath) &&
              common.isDefinedAndNotEmpty(firstProjectRemotePublicKeyPath)
            ) {
              privateKey = fse
                .readFileSync(firstProjectRemotePrivateKeyPath)
                .toString();

              publicKey = fse
                .readFileSync(firstProjectRemotePublicKeyPath)
                .toString();
            }

            firstProject = await this.projectsService.addProject({
              orgId: firstOrg.org_id,
              name: firstProjectName,
              user: firstUser,
              traceId: common.makeId(),
              projectId: firstProjectId,
              testProjectId: 'first-project',
              remoteType: firstProjectRemoteType,
              gitUrl: firstProjectRemoteGitUrl,
              privateKey: privateKey,
              publicKey: publicKey
            });
          }
        }
      }
    } catch (e) {
      logToConsoleBackend({
        log: e,
        logLevel: common.LogLevelEnum.Error,
        logger: this.logger,
        cs: this.cs
      });

      process.exit(1);
    }
  }
}
