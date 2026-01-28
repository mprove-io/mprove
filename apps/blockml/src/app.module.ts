import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SRC_PATH } from '#common/constants/top-blockml';
import { ErEnum } from '#common/enums/er.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { CallerEnum } from '#common/enums/special/caller.enum';
import { capitalizeFirstLetter } from '#common/functions/capitalize-first-letter';
import { BmlFile } from '#common/interfaces/blockml/bml-file';
import { File3 } from '#common/interfaces/blockml/internal/file-3';
import { Preset } from '#common/interfaces/blockml/preset';
import { ServerError } from '#common/models/server-error';
import { WithTraceSpan } from '#node-common/decorators/with-trace-span.decorator';
import { BlockmlConfig } from '~blockml/config/blockml-config';
import { appServices } from './app-services';
import { getConfig } from './config/get.config';
import { makeLineNumbers } from './functions/build-yaml/make-line-numbers';
import { yamlToObjects } from './functions/build-yaml/yaml-to-objects';
import { collectFiles } from './functions/extra/collect-files';
import { logToConsoleBlockml } from './functions/extra/log-to-console-blockml';
import { BmError } from './models/bm-error';
import { PresetsService } from './services/presets.service';

let devConfig = getConfig(); // check error once

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [getConfig],
      isGlobal: true
    })
  ],
  controllers: [],
  providers: [Logger, ...appServices]
})
export class AppModule implements OnModuleInit {
  constructor(
    private presetsService: PresetsService,
    private logger: Logger,
    private cs: ConfigService
  ) {}

  @WithTraceSpan()
  async onModuleInit() {
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
        throw new ServerError({
          message: ErEnum.BLOCKML_LOAD_PRESETS_FAILED,
          customData: { errors: errors }
        });
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

    setTimeout(() => {
      let blockmlEnv = this.cs.get<BlockmlConfig['blockmlEnv']>('blockmlEnv');

      logToConsoleBlockml({
        log: `NODE_ENV "${process.env.NODE_ENV}", BLOCKML_ENV "${blockmlEnv}"`,
        logLevel: LogLevelEnum.Info,
        logger: this.logger,
        cs: this.cs
      });
    }, 1000);
  }
}
