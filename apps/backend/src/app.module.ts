import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { MailerModule } from '@nestjs-modules/mailer';
import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as fse from 'fs-extra';
import * as mg from 'nodemailer-mailgun-transport';
import { forEachSeries } from 'p-iteration';
import { Connection } from 'typeorm';
import { appControllers } from './app-controllers';
import { appEntities } from './app-entities';
import { appMigrations } from './app-migrations';
import { appProviders } from './app-providers';
import { appRepositories } from './app-repositories';
import { apiToBackend } from './barrels/api-to-backend';
import { common } from './barrels/common';
import { enums } from './barrels/enums';
import { helper } from './barrels/helper';
import { interfaces } from './barrels/interfaces';
import { maker } from './barrels/maker';
import { repositories } from './barrels/repositories';
import { getConfig } from './config/get.config';
import { DbService } from './services/db.service';
import { OrgsService } from './services/orgs.service';
import { ProjectsService } from './services/projects.service';
import { UsersService } from './services/users.service';

let retry = require('async-retry');

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
    let rabbitUser = cs.get<interfaces.Config['backendRabbitUser']>(
      'backendRabbitUser'
    );
    let rabbitPass = cs.get<interfaces.Config['backendRabbitPass']>(
      'backendRabbitPass'
    );
    let rabbitHost = cs.get<interfaces.Config['backendRabbitHost']>(
      'backendRabbitHost'
    );
    let rabbitPort = cs.get<interfaces.Config['backendRabbitPort']>(
      'backendRabbitPort'
    );
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
        wait: backendEnv !== enums.BackendEnvEnum.PROD,
        timeout: backendEnv !== enums.BackendEnvEnum.PROD ? 75000 : undefined
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

let typeormFeatureModule = TypeOrmModule.forFeature([...appRepositories]);

let mailerModule = MailerModule.forRootAsync({
  useFactory: (cs: ConfigService<interfaces.Config>) => {
    let transport;

    let emailTransport = cs.get<interfaces.Config['emailTransport']>(
      'emailTransport'
    );

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

    let fromName = cs.get<interfaces.Config['sendEmailFromName']>(
      'sendEmailFromName'
    );

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
    typeormRootModule,
    typeormFeatureModule
  ],
  controllers: appControllers,
  providers: appProviders
})
export class AppModule implements OnModuleInit {
  constructor(
    private connection: Connection,
    private usersService: UsersService,
    private orgsService: OrgsService,
    private projectsService: ProjectsService,
    private cs: ConfigService<interfaces.Config>,
    private usersRepository: repositories.UsersRepository,
    private orgsRepository: repositories.OrgsRepository,
    private projectsRepository: repositories.ProjectsRepository,
    private dbService: DbService
  ) {}

  async onModuleInit() {
    try {
      if (helper.isScheduler(this.cs)) {
        let backendEnv = this.cs.get<interfaces.Config['backendEnv']>(
          'backendEnv'
        );

        if (backendEnv === enums.BackendEnvEnum.PROD) {
          // TODO: remove sleep by checking rabbit connection availability
          let sleepSeconds = 20;
          let arraySeconds = Array.from(Array(sleepSeconds).keys()).reverse();
          arraySeconds.pop();

          await forEachSeries(arraySeconds, async key => {
            common.logToConsole(
              `${key} seconds sleep for rabbitMQ to be ready ...`
            );
            await common.sleep(1000);
          });

          common.logToConsole('Sleep ended, continue ...');
        }

        const migrationsPending = await this.connection.showMigrations();

        if (migrationsPending) {
          const migrations = await this.connection.runMigrations({
            transaction: 'all'
          });
          migrations.forEach(migration => {
            common.logToConsole(`Migration ${migration.name} success`);
          });
        } else {
          common.logToConsole('No migrations pending');
        }

        let email = this.cs.get<interfaces.Config['firstUserEmail']>(
          'firstUserEmail'
        );

        let password = this.cs.get<interfaces.Config['firstUserPassword']>(
          'firstUserPassword'
        );

        let firstOrgId = this.cs.get<interfaces.Config['firstOrgId']>(
          'firstOrgId'
        );

        let firstProjectId = this.cs.get<interfaces.Config['firstProjectId']>(
          'firstProjectId'
        );

        let firstUser: any;

        if (common.isDefined(email) && common.isDefined(password)) {
          firstUser = await this.usersRepository.findOne({ email: email });

          if (common.isUndefined(firstUser)) {
            firstUser = await this.usersService.addFirstUser({
              email: email,
              password: password
            });
          }
        }

        await retry(
          async (bail: any) => {
            let firstOrg;

            if (common.isDefined(firstOrgId) && common.isDefined(firstUser)) {
              firstOrg = await this.orgsRepository.findOne({
                org_id: firstOrgId
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
            }

            let firstProject;

            if (
              common.isDefined(firstProjectId) &&
              common.isDefined(firstOrg) &&
              common.isDefined(firstUser)
            ) {
              firstProject = await this.projectsRepository.findOne({
                project_id: firstProjectId
              });

              if (common.isUndefined(firstProject)) {
                let firstProjectDwhPostgresPassword = this.cs.get<
                  interfaces.Config['firstProjectDwhPostgresPassword']
                >('firstProjectDwhPostgresPassword');

                let c1 = maker.makeConnection({
                  projectId: firstProjectId,
                  connectionId: 'c1_postgres',
                  type: common.ConnectionTypeEnum.PostgreSQL,
                  postgresHost: 'dwh-postgres',
                  postgresPort: 5432,
                  postgresDatabase: 'p_db',
                  postgresUser: 'postgres',
                  postgresPassword: firstProjectDwhPostgresPassword,
                  bigqueryCredentials: undefined,
                  bigqueryQuerySizeLimitGb: 1,
                  isSSL: false
                });

                let backendBigqueryPath = this.cs.get<
                  interfaces.Config['backendBigqueryPath']
                >('backendBigqueryPath');

                let bigqueryTestCredentials = JSON.parse(
                  fse.readFileSync(backendBigqueryPath).toString()
                );

                let c2 = maker.makeConnection({
                  projectId: firstProjectId,
                  connectionId: 'c3_bigquery',
                  type: common.ConnectionTypeEnum.BigQuery,
                  postgresHost: undefined,
                  postgresPort: undefined,
                  postgresDatabase: undefined,
                  postgresUser: undefined,
                  postgresPassword: undefined,
                  bigqueryCredentials: bigqueryTestCredentials,
                  bigqueryQuerySizeLimitGb: 1,
                  isSSL: true
                });

                await this.dbService.writeRecords({
                  modify: false,
                  records: {
                    connections: [c1, c2]
                  }
                });

                firstProject = await this.projectsService.addProject({
                  orgId: firstOrg.org_id,
                  name: common.FIRST_PROJECT_NAME,
                  user: firstUser,
                  traceId: common.makeId(),
                  projectId: firstProjectId,
                  testProjectId: 'first-project'
                });
              }
            }
          },
          {
            retries: 3,
            minTimeout: 3000,
            factor: 1, // (default 2)
            randomize: true, // 1 to 2 (default true)
            onRetry: (e: any) => {
              let serverError = new common.ServerError({
                message: apiToBackend.ErEnum.BACKEND_MODULE_INIT_ORG_RETRY,
                originalError: e
              });

              common.logToConsole(serverError);
            }
          }
        );
      }
    } catch (e) {
      common.handleError(e);
      process.exit(1);
    }
  }
}
