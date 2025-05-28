import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { constants } from '~blockml/barrels/constants';
import { appControllers } from './app-controllers';
import { appServices } from './app-services';
import { barYaml } from './barrels/bar-yaml';
import { common } from './barrels/common';
import { interfaces } from './barrels/interfaces';
import { getConfig } from './config/get.config';
import { logToConsoleBlockml } from './functions/log-to-console-blockml';
import { BmError } from './models/bm-error';
import { PresetsService } from './services/presets.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [getConfig],
      isGlobal: true
    }),

    RabbitMQModule.forRootAsync(RabbitMQModule, {
      useFactory: (cs: ConfigService<interfaces.Config>) => {
        let rabbitUser =
          cs.get<interfaces.Config['blockmlRabbitUser']>('blockmlRabbitUser');
        let rabbitPass =
          cs.get<interfaces.Config['blockmlRabbitPass']>('blockmlRabbitPass');
        let rabbitPort =
          cs.get<interfaces.Config['blockmlRabbitPort']>('blockmlRabbitPort');
        let rabbitHost =
          cs.get<interfaces.Config['blockmlRabbitHost']>('blockmlRabbitHost');
        let rabbitProtocol = cs.get<interfaces.Config['blockmlRabbitProtocol']>(
          'blockmlRabbitProtocol'
        );

        return {
          exchanges: [
            {
              name: common.RabbitExchangesEnum.Blockml.toString(),
              type: 'direct'
            },
            {
              name: common.RabbitExchangesEnum.BlockmlWorker.toString(),
              type: 'direct'
            }
          ],
          uri: [
            `${rabbitProtocol}://${rabbitUser}:${rabbitPass}@${rabbitHost}:${rabbitPort}`
          ],
          connectionInitOptions: {
            // wait for connection on startup, but do not recover when connection lost
            wait: false,
            timeout: undefined
          },
          connectionManagerOptions: {
            connectionOptions: { rejectUnauthorized: false }
          }
        };
      },
      inject: [ConfigService]
    })
  ],
  controllers: appControllers,
  providers: [Logger, ...appServices]
})
export class AppModule implements OnModuleInit {
  constructor(
    private presetsService: PresetsService,
    private logger: Logger,
    private cs: ConfigService
  ) {}

  async onModuleInit() {
    logToConsoleBlockml({
      log: `NODE_ENV is set to "${process.env.NODE_ENV}"`,
      logLevel: common.LogLevelEnum.Info,
      logger: this.logger,
      cs: this.cs
    });

    try {
      let errors: BmError[] = [];

      let presetFiles: common.BmlFile[] = await barYaml.collectFiles(
        {
          dir: `${constants.SRC_PATH}/presets`,
          structId: undefined,
          caller: common.CallerEnum.AppModule,
          skipLog: true
        },
        this.cs
      );

      let filesAny: any[] = barYaml.yamlToObjects(
        {
          file3s: presetFiles.map(y => {
            let pathParts = y.path.split('.');

            let f: common.File3 = {
              ext: `.${pathParts.slice(1).join('.')}` as any,
              name: y.name,
              path: y.path,
              content: y.content
            };
            return f;
          }),
          structId: undefined,
          errors: errors,
          caller: common.CallerEnum.AppModule
        },
        this.cs
      );

      filesAny = barYaml.makeLineNumbers(
        {
          filesAny: filesAny,
          structId: undefined,
          errors: errors,
          caller: common.CallerEnum.AppModule,
          isSetLineNumToZero: true
        },
        this.cs
      );

      let presets: common.Preset[] = [];

      if (errors.length > 0) {
        console.log(errors);
        throw new Error('Failed to load presets');
      } else {
        filesAny.forEach(x => {
          if (
            x.path.includes('/') === false &&
            x.path.endsWith('.store.preset')
          ) {
            let preset: common.Preset = {
              presetId: x.name.split('.')[0],
              path: x.path,
              label:
                (x as any)?.label ||
                (x.name.split('.')[0].length > 0
                  ? x.name.split('.')[0]
                  : x.name),
              parsedContent: x
            };

            presets.push(preset);
          }
        });
      }

      this.presetsService.setPresets(presets);
    } catch (e) {
      logToConsoleBlockml({
        log: e,
        logLevel: common.LogLevelEnum.Error,
        logger: this.logger,
        cs: this.cs
      });

      process.exit(1);
    }
  }
}
