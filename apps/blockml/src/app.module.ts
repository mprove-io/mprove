import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BlockmlConfig } from '~blockml/config/blockml-config';
import { SRC_PATH } from '~common/constants/top-blockml';
import { LogLevelEnum } from '~common/enums/log-level.enum';
import { RabbitExchangesEnum } from '~common/enums/rabbit-exchanges.enum';
import { CallerEnum } from '~common/enums/special/caller.enum';
import { capitalizeFirstLetter } from '~common/functions/capitalize-first-letter';
import { BmlFile } from '~common/interfaces/blockml/bml-file';
import { File3 } from '~common/interfaces/blockml/internal/file-3';
import { Preset } from '~common/interfaces/blockml/preset';
import { appControllers } from './app-controllers';
import { appServices } from './app-services';
import { getConfig } from './config/get.config';
import { makeLineNumbers } from './functions/build-yaml/make-line-numbers';
import { yamlToObjects } from './functions/build-yaml/yaml-to-objects';
import { collectFiles } from './functions/extra/collect-files';
import { logToConsoleBlockml } from './functions/extra/log-to-console-blockml';
import { BmError } from './models/bm-error';
import { PresetsService } from './services/presets.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [getConfig],
      isGlobal: true
    }),

    RabbitMQModule.forRootAsync(RabbitMQModule, {
      useFactory: (cs: ConfigService<BlockmlConfig>) => {
        let rabbitUser =
          cs.get<BlockmlConfig['blockmlRabbitUser']>('blockmlRabbitUser');
        let rabbitPass =
          cs.get<BlockmlConfig['blockmlRabbitPass']>('blockmlRabbitPass');
        let rabbitPort =
          cs.get<BlockmlConfig['blockmlRabbitPort']>('blockmlRabbitPort');
        let rabbitHost =
          cs.get<BlockmlConfig['blockmlRabbitHost']>('blockmlRabbitHost');
        let rabbitProtocol = cs.get<BlockmlConfig['blockmlRabbitProtocol']>(
          'blockmlRabbitProtocol'
        );

        return {
          exchanges: [
            {
              name: RabbitExchangesEnum.Blockml.toString(),
              type: 'direct'
            },
            {
              name: RabbitExchangesEnum.BlockmlWorker.toString(),
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
      logLevel: LogLevelEnum.Info,
      logger: this.logger,
      cs: this.cs
    });

    try {
      let errors: BmError[] = [];

      let presetFiles: BmlFile[] = await collectFiles(
        {
          dir: `${SRC_PATH}/presets`,
          repoDir: undefined,
          structId: undefined,
          caller: CallerEnum.AppModule,
          skipLog: true
        },
        this.cs
      );

      let filesAny: any[] = yamlToObjects(
        {
          file3s: presetFiles.map(y => {
            let pathParts = y.path.split('.');

            let f: File3 = {
              ext: `.${pathParts.slice(1).join('.')}` as any,
              name: y.name,
              path: y.path,
              content: y.content
            };
            return f;
          }),
          structId: undefined,
          errors: errors,
          caller: CallerEnum.AppModule
        },
        this.cs
      );

      filesAny = makeLineNumbers(
        {
          filesAny: filesAny,
          structId: undefined,
          errors: errors,
          caller: CallerEnum.AppModule,
          isSetLineNumToZero: true
        },
        this.cs
      );

      let presets: Preset[] = [];

      if (errors.length > 0) {
        console.log(errors);
        throw new Error('Failed to load presets');
      } else {
        filesAny.forEach(x => {
          if (x.path.endsWith('.store.preset')) {
            let presetId = x.name.split('.')[0];
            let path = x.path;
            let label =
              (x as any)?.label ||
              (x.name.split('.')[0].length > 0
                ? x.name
                    .split('.')[0]
                    .split('_')
                    .map((word: string) => capitalizeFirstLetter(word))
                    .join(' ')
                : x.name);

            delete x.name;
            delete x.path;
            delete x.ext;

            let preset: Preset = {
              presetId: presetId,
              path: path,
              label: label,
              parsedContent: x
            };

            // console.log('Object.keys(preset.parsedContent)');
            // console.log(Object.keys(preset.parsedContent));

            presets.push(preset);
          }
        });
      }

      this.presetsService.setPresets(presets);
    } catch (e) {
      logToConsoleBlockml({
        log: e,
        logLevel: LogLevelEnum.Error,
        logger: this.logger,
        cs: this.cs
      });

      process.exit(1);
    }
  }
}
