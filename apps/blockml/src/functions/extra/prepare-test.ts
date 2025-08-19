import { Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import * as fse from 'fs-extra';
import { WinstonModule } from 'nest-winston';
import { appServices } from '~blockml/app-services';
import { getConfig } from '~blockml/config/get.config';
import { RebuildStructService } from '~blockml/controllers/rebuild-struct/rebuild-struct.service';
import { ConsumerMainService } from '~blockml/services/consumer-main.service';
import { RabbitService } from '~blockml/services/rabbit.service';
import { APP_NAME_BLOCKML, SRC_PATH } from '~common/constants/top-blockml';
import { BoolEnum } from '~common/enums/bool.enum';
import { CallerEnum } from '~common/enums/special/caller.enum';
import { FuncEnum } from '~common/enums/special/func.enum';
import { isDefined } from '~common/functions/is-defined';
import { BlockmlConfig } from '~common/interfaces/blockml/blockml-config';
import { ProjectConnection } from '~common/interfaces/blockml/project-connection';
import { getLoggerOptions } from '~node-common/functions/get-logger-options';

export async function prepareTest(
  caller: CallerEnum,
  func: FuncEnum,
  testId: string,
  connection?: ProjectConnection,
  overrideConfigOptions?: BlockmlConfig
) {
  let config = getConfig();

  let mockConfig: BlockmlConfig = Object.assign(
    config,
    <BlockmlConfig>{ logFunc: func },
    overrideConfigOptions
  );

  // let presetFiles: BmlFile[] = await barYaml.collectFiles(
  //   {
  //     dir: `${SRC_PATH}/presets`,
  //     structId: undefined,
  //     caller: CallerEnum.AppModule,
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
        getLoggerOptions({
          appName: APP_NAME_BLOCKML,
          isJson: config.blockmlLogIsJson === BoolEnum.TRUE
        })
      )
    ],
    providers: [Logger, ...appServices]
  })
    .overrideProvider(ConfigService)
    .useValue({ get: (key: any) => mockConfig[key as keyof BlockmlConfig] })
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

  let cs = moduleRef.get<ConfigService<BlockmlConfig>>(ConfigService);
  let logsPath = cs.get<BlockmlConfig['logsPath']>('logsPath');
  let copyLogsToModels =
    cs.get<BlockmlConfig['copyLogsToModels']>('copyLogsToModels');

  let funcArray = func.toString().split('/');

  let pack = funcArray[0];
  let f = funcArray[1];

  let traceId = testId;

  let structId = isDefined(connection)
    ? `${caller}/${f}/${testId}/${connection.type}`
    : `${caller}/${f}/${testId}`;

  let fromDir = `${logsPath}/${caller}/${f}/${structId}`;
  fse.emptyDirSync(fromDir);

  let dataDir = `${SRC_PATH}/functions/${pack}/tests/${f}/data/${testId}`;

  let toDir =
    copyLogsToModels === BoolEnum.FALSE
      ? null
      : isDefined(connection)
        ? `${SRC_PATH}/functions/${pack}/tests/${f}/logs/${testId}/${connection.type}`
        : `${SRC_PATH}/functions/${pack}/tests/${f}/logs/${testId}`;

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
