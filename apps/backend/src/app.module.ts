import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { MailerModule } from '@nestjs-modules/mailer';
import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as mg from 'nodemailer-mailgun-transport';
import { Connection } from 'typeorm';
import { appControllers } from './app-controllers';
import { appEntities } from './app-entities';
import { appMigrations } from './app-migrations';
import { appProviders } from './app-providers';
import { appRepositories } from './app-repositories';
import { common } from './barrels/common';
import { enums } from './barrels/enums';
import { helper } from './barrels/helper';
import { interfaces } from './barrels/interfaces';
import { repositories } from './barrels/repositories';
import { getConfig } from './config/get.config';
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
    let rabbitUser = cs.get<interfaces.Config['rabbitUser']>('rabbitUser');
    let rabbitPass = cs.get<interfaces.Config['rabbitPass']>('rabbitPass');
    let rabbitHost = cs.get<interfaces.Config['rabbitHost']>('rabbitHost');
    let rabbitPort = cs.get<interfaces.Config['rabbitPort']>('rabbitPort');
    let rabbitProtocol = cs.get<interfaces.Config['rabbitProtocol']>(
      'rabbitProtocol'
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
    host: cs.get<interfaces.Config['mysqlHost']>('mysqlHost'),
    port: cs.get<interfaces.Config['mysqlPort']>('mysqlPort'),
    username: cs.get<interfaces.Config['mysqlUsername']>('mysqlUsername'),
    password: cs.get<interfaces.Config['mysqlPassword']>('mysqlPassword'),
    database: cs.get<interfaces.Config['mysqlDatabase']>('mysqlDatabase'),
    entities: appEntities,
    migrations: appMigrations
  }),
  inject: [ConfigService]
});

let typeormFeatureModule = TypeOrmModule.forFeature([...appRepositories]);

let mailerModule = MailerModule.forRootAsync({
  useFactory: (cs: ConfigService<interfaces.Config>) => {
    let mgTransport = mg({
      auth: {
        api_key: cs.get<interfaces.Config['mailgunActiveApiKey']>(
          'mailgunActiveApiKey'
        ),
        domain: cs.get<interfaces.Config['mailgunDomain']>('mailgunDomain')
      }
    });

    let smtpConfig = {
      host: cs.get<interfaces.Config['smtpHost']>('smtpHost'),
      port: cs.get<interfaces.Config['smtpPort']>('smtpPort'),
      secure:
        cs.get<interfaces.Config['smtpSecure']>('smtpSecure') ===
        common.BoolEnum.TRUE
          ? true
          : false,
      auth: {
        user: cs.get<interfaces.Config['smtpAuthUser']>('smtpAuthUser'),
        pass: cs.get<interfaces.Config['smtpAuthPassword']>('smtpAuthPassword')
      }
    };

    let transport =
      cs.get<interfaces.Config['emailTransport']>('emailTransport') ===
      enums.EmailTransportEnum.MAILGUN
        ? mgTransport
        : smtpConfig;

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
    private projectsRepository: repositories.ProjectsRepository
  ) {}

  async onModuleInit() {
    try {
      if (helper.isScheduler(this.cs)) {
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

        let firstUser;

        if (common.isDefined(email) && common.isDefined(password)) {
          firstUser = await this.usersRepository.findOne({ email: email });

          if (common.isUndefined(firstUser)) {
            firstUser = await this.usersService.addFirstUser({
              email: email,
              password: password
            });
          }
        }

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
            firstProject = await this.projectsService.addProject({
              orgId: firstOrg.org_id,
              name: common.FIRST_PROJECT_NAME,
              user: firstUser,
              traceId: common.makeId(),
              projectId: firstProjectId,
              testProjectId: 't1'
            });
          }
        }
      }
    } catch (e) {
      common.handleError(e);
      process.exit(1);
    }
  }
}
