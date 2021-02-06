import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import * as fse from 'fs-extra';
import { appServices } from '~blockml/app-services';
import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { getConfig } from '~blockml/config/get.config';
import { RebuildStructService } from '~blockml/controllers/rebuild-struct/rebuild-struct.service';
import { ConsumerMainService } from '~blockml/services/consumer-main.service';
import { ConsumerWorkerService } from '~blockml/services/consumer-worker.service';
import { RabbitService } from '~blockml/services/rabbit.service';

export async function prepareTest(
  caller: enums.CallerEnum,
  func: enums.FuncEnum,
  testId: string,
  connection?: common.ProjectConnection,
  overrideConfigOptions?: interfaces.Config
) {
  let mockConfig: interfaces.Config = Object.assign(
    getConfig(),
    <interfaces.Config>{ logFunc: func },
    overrideConfigOptions
  );

  let moduleRef: TestingModule = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        load: [getConfig],
        isGlobal: true
      })
    ],
    providers: appServices
  })
    .overrideProvider(ConfigService)
    .useValue({ get: key => mockConfig[key] })
    .overrideProvider(RabbitService)
    .useValue({})
    .overrideProvider(ConsumerMainService)
    .useValue({})
    .overrideProvider(ConsumerWorkerService)
    .useValue({})
    .compile();

  let structService = moduleRef.get<RebuildStructService>(RebuildStructService);

  let cs = moduleRef.get<ConfigService<interfaces.Config>>(ConfigService);
  let logsPath = cs.get<interfaces.Config['logsPath']>('logsPath');
  let copyLogsToModels = cs.get<interfaces.Config['copyLogsToModels']>(
    'copyLogsToModels'
  );

  let funcArray = func.toString().split('/');

  let pack = funcArray[0];
  let f = funcArray[1];

  let traceId = '123';

  let structId = helper.isDefined(connection)
    ? `${caller}/${f}/${testId}/${connection.type}`
    : `${caller}/${f}/${testId}`;

  let fromDir = `${logsPath}/${caller}/${f}/${structId}`;
  fse.emptyDirSync(fromDir);

  let dataDir = `${constants.SRC_PATH}/models/${pack}/tests/${f}/data/${testId}`;

  let toDir =
    copyLogsToModels === common.BoolEnum.FALSE
      ? null
      : helper.isDefined(connection)
      ? `${constants.SRC_PATH}/models/${pack}/tests/${f}/logs/${testId}/${connection.type}`
      : `${constants.SRC_PATH}/models/${pack}/tests/${f}/logs/${testId}`;

  return {
    structService: structService,
    traceId: traceId,
    structId: structId,
    dataDir: dataDir,
    fromDir: fromDir,
    toDir: toDir
  };
}
