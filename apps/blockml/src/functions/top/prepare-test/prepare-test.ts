import { Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, type TestingModule } from '@nestjs/testing';
import fse from 'fs-extra';
import { WinstonModule } from 'nest-winston';
import { appServices } from '#blockml/app-services';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { getConfig } from '#blockml/config/get.config';
import { RebuildStructService } from '#blockml/controllers/rebuild-struct/rebuild-struct.service';
import { ConsumerService } from '#blockml/services/consumer/consumer.service';
import { APP_NAME_BLOCKML } from '#common/constants/top-blockml';
import { BlockmlEnvEnum } from '#common/enums/env/blockml-env.enum';
import type { CallerEnum } from '#common/enums/special/caller.enum';
import type { FuncEnum } from '#common/enums/special/func.enum';
import { isDefined } from '#common/functions/is-defined';
import type { ProjectConnection } from '#common/zod/backend/project-connection';
import { getLoggerOptions } from '#node-common/functions/get-logger-options/get-logger-options';
import { resolveTestSourceDir } from './resolve-test-source-dir/resolve-test-source-dir';

export type PrepareTestOutput = {
  structService: RebuildStructService;
  logger: Logger;
  traceId: string;
  structId: string;
  dataDir: string;
  fromDir: string;
  toDir?: string;
  cs: ConfigService<BlockmlConfig>;
};

export async function prepareTest(item: {
  caller: CallerEnum;
  func: FuncEnum;
  testId: string;
  testsDir: string;
  connection?: ProjectConnection;
  overrideConfigOptions?: Partial<BlockmlConfig>;
}): Promise<PrepareTestOutput> {
  let { caller, func, testId, connection, overrideConfigOptions } = item;

  let extraOverride: Partial<BlockmlConfig> = {
    blockmlEnv: BlockmlEnvEnum.TEST,
    // blockmlLogResponseOk: true,
    blockmlLogResponseError: true
  };

  let config: BlockmlConfig = getConfig();

  let mockConfig: BlockmlConfig = Object.assign(
    config,
    <Partial<BlockmlConfig>>{ logFunc: func },
    overrideConfigOptions,
    extraOverride
  );

  let moduleRef: TestingModule = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        load: [getConfig],
        isGlobal: true
      }),
      WinstonModule.forRoot(
        getLoggerOptions({
          appName: APP_NAME_BLOCKML,
          isJson: config.blockmlLogIsJson
        })
      )
    ],
    providers: [Logger, ...appServices]
  })
    .overrideProvider(ConfigService)
    .useValue({ get: (key: any) => mockConfig[key as keyof BlockmlConfig] })
    .overrideProvider(ConsumerService)
    .useValue({})
    .compile();

  let structService: RebuildStructService =
    moduleRef.get<RebuildStructService>(RebuildStructService);

  let logger: Logger = await moduleRef.resolve<Logger>(Logger);

  let cs: ConfigService<BlockmlConfig> =
    moduleRef.get<ConfigService<BlockmlConfig>>(ConfigService);

  let logsPath: string = cs.get<BlockmlConfig['logsPath']>('logsPath');

  let isCopyLogsToModels: boolean =
    cs.get<BlockmlConfig['copyLogsToModels']>('copyLogsToModels');

  let funcArray: string[] = func.toString().split('/');

  let f = funcArray[1];

  let traceId = testId;

  let structId = isDefined(connection)
    ? `${caller}/${f}/${testId}/${connection.type}`
    : `${caller}/${f}/${testId}`;

  let fromDir = `${logsPath}/${caller}/${f}/${structId}`;

  fse.emptyDirSync(fromDir);

  let testsDir: string = resolveTestSourceDir({ testsDir: item.testsDir });

  let dataDir = `${testsDir}/data/${testId}`;

  let toDir =
    isCopyLogsToModels === false
      ? null
      : isDefined(connection)
        ? `${testsDir}/logs/${testId}/${connection.type}`
        : `${testsDir}/logs/${testId}`;

  let output: PrepareTestOutput = {
    structService: structService,
    logger: logger,
    traceId: traceId,
    structId: structId,
    dataDir: dataDir,
    fromDir: fromDir,
    toDir: toDir,
    cs: cs
  };

  return output;
}
