import { Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import * as fse from 'fs-extra';
import { WinstonModule } from 'nest-winston';
import { appServices } from '~blockml/app-services';
import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';
import { interfaces } from '~blockml/barrels/interfaces';
import { nodeCommon } from '~blockml/barrels/node-common';
import { getConfig } from '~blockml/config/get.config';
import { RebuildStructService } from '~blockml/controllers/rebuild-struct/rebuild-struct.service';
import { ConsumerMainService } from '~blockml/services/consumer-main.service';
import { RabbitService } from '~blockml/services/rabbit.service';
// import { PresetsService } from '~blockml/services/presets.service';
// import { BmlFile } from '~common/interfaces/blockml/bml-file';
// import { barYaml } from '~blockml/barrels/bar-yaml';

export async function prepareTest(
  caller: common.CallerEnum,
  func: common.FuncEnum,
  testId: string,
  connection?: common.ProjectConnection,
  overrideConfigOptions?: interfaces.Config
) {
  let config = getConfig();

  let mockConfig: interfaces.Config = Object.assign(
    config,
    <interfaces.Config>{ logFunc: func },
    overrideConfigOptions
  );

  // let presetFiles: common.BmlFile[] = await barYaml.collectFiles(
  //   {
  //     dir: `${constants.SRC_PATH}/presets`,
  //     structId: undefined,
  //     caller: common.CallerEnum.AppModule,
  //     skipLog: true
  //   },
  //   undefined
  // );

  let moduleRef: TestingModule = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        load: [getConfig],
        isGlobal: true
      }),
      WinstonModule.forRoot(
        nodeCommon.getLoggerOptions({
          appName: constants.APP_NAME_BLOCKML,
          isJson: config.blockmlLogIsJson === common.BoolEnum.TRUE
        })
      )
    ],
    providers: [Logger, ...appServices]
  })
    .overrideProvider(ConfigService)
    .useValue({ get: (key: any) => mockConfig[key as keyof interfaces.Config] })
    // .overrideProvider(PresetsService)
    // .useValue({
    //   getPresets: (): BmlFile[] => {
    //     return presetFiles;
    //   }
    // })
    .overrideProvider(RabbitService)
    .useValue({})
    .overrideProvider(ConsumerMainService)
    .useValue({})
    .compile();

  // let app: INestApplication = moduleRef.createNestApplication();
  // await app.init();

  let structService = moduleRef.get<RebuildStructService>(RebuildStructService);
  let logger = await moduleRef.resolve<Logger>(Logger);

  let cs = moduleRef.get<ConfigService<interfaces.Config>>(ConfigService);
  let logsPath = cs.get<interfaces.Config['logsPath']>('logsPath');
  let copyLogsToModels =
    cs.get<interfaces.Config['copyLogsToModels']>('copyLogsToModels');

  let funcArray = func.toString().split('/');

  let pack = funcArray[0];
  let f = funcArray[1];

  let traceId = testId;

  let structId = common.isDefined(connection)
    ? `${caller}/${f}/${testId}/${connection.type}`
    : `${caller}/${f}/${testId}`;

  let fromDir = `${logsPath}/${caller}/${f}/${structId}`;
  fse.emptyDirSync(fromDir);

  let dataDir = `${constants.SRC_PATH}/models/${pack}/tests/${f}/data/${testId}`;

  let toDir =
    copyLogsToModels === common.BoolEnum.FALSE
      ? null
      : common.isDefined(connection)
        ? `${constants.SRC_PATH}/models/${pack}/tests/${f}/logs/${testId}/${connection.type}`
        : `${constants.SRC_PATH}/models/${pack}/tests/${f}/logs/${testId}`;

  return {
    structService: structService,
    logger: logger,
    traceId: traceId,
    structId: structId,
    dataDir: dataDir,
    fromDir: fromDir,
    toDir: toDir,
    cs: cs
  };
}
