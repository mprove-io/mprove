import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { MailerModule } from '@nestjs-modules/mailer';
import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as mg from 'nodemailer-mailgun-transport';
import { Connection } from 'typeorm';
import { appControllers } from './app-controllers';
import { appEntities } from './app-entities';
import { appProviders } from './app-providers';
import { appRepositories } from './app-repositories';
import { api } from './barrels/api';
import { enums } from './barrels/enums';
import { helper } from './barrels/helper';
import { interfaces } from './barrels/interfaces';
import { repositories } from './barrels/repositories';
import { getConfig } from './config/get.config';
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
    let rabbitUser = cs.get<interfaces.Config['rabbitmqDefaultUser']>(
      'rabbitmqDefaultUser'
    );

    let rabbitPass = cs.get<interfaces.Config['rabbitmqDefaultPass']>(
      'rabbitmqDefaultPass'
    );

    let backendEnv = cs.get<interfaces.Config['backendEnv']>('backendEnv');

    return {
      exchanges: [
        {
          name: api.RabbitExchangesEnum.Blockml.toString(),
          type: 'direct'
        },
        {
          name: api.RabbitExchangesEnum.Disk.toString(),
          type: 'direct'
        }
      ],
      uri: [`amqp://${rabbitUser}:${rabbitPass}@rabbit:5672`],
      connectionInitOptions: {
        // wait for connection on startup, but do not recover when connection lost
        wait: backendEnv !== enums.BackendEnvEnum.PROD,
        timeout: backendEnv !== enums.BackendEnvEnum.PROD ? 75000 : undefined
      }
    };
  },
  inject: [ConfigService]
});

let typeormRootModule = TypeOrmModule.forRootAsync({
  useFactory: (cs: ConfigService<interfaces.Config>) => ({
    type: 'mysql',
    host: 'db',
    port: 3306,
    username: 'root',
    password: cs.get<interfaces.Config['mysqlRootPassword']>(
      'mysqlRootPassword'
    ),
    database: cs.get<interfaces.Config['mysqlDatabase']>('mysqlDatabase'),
    entities: appEntities,
    migrations: [__dirname + '/migrations/**/*{.ts,.js}']
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
        api.BoolEnum.TRUE
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
    private cs: ConfigService<interfaces.Config>,
    private userRepository: repositories.UserRepository
  ) {}

  async onModuleInit() {
    try {
      await this.connection.runMigrations();

      let email = this.cs.get<interfaces.Config['firstUserEmail']>(
        'firstUserEmail'
      );

      let password = this.cs.get<interfaces.Config['firstUserPassword']>(
        'firstUserPassword'
      );

      if (helper.isDefined(email) && helper.isDefined(password)) {
        let firstUser = await this.userRepository.findOne({ email: email });

        if (helper.isUndefined(firstUser)) {
          await this.usersService.addFirstUser({
            email: email,
            password: password
          });
        }
      }
    } catch (e) {
      api.handleError(e);
      process.exit(1);
    }
  }
}
