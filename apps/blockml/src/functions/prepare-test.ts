import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import * as fse from 'fs-extra';
import { AppModule } from '~blockml/app.module';
import { api } from '~blockml/barrels/api';
import { constants } from '~blockml/barrels/constants';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { getConfig } from '~blockml/config/get.config';
import { RebuildStructService } from '~blockml/controllers/rebuild-struct/rebuild-struct.service';
import { RabbitService } from '~blockml/services/rabbit.service';

export async function prepareTest(
  caller: enums.CallerEnum,
  func: enums.FuncEnum,
  testId: string,
  connection?: api.ProjectConnection,
  overrideConfigOptions?: interfaces.Config
) {
  let mockConfig: interfaces.Config = Object.assign(
    getConfig(),
    <interfaces.Config>{ blockmlLogFunc: func },
    overrideConfigOptions
  );

  let moduleRef: TestingModule = await Test.createTestingModule({
    imports: [AppModule]
  })
    .overrideProvider(ConfigService)
    .useValue({ get: key => mockConfig[key] })
    .overrideProvider(RabbitService)
    .useValue({})
    .compile();

  let structService = moduleRef.get<RebuildStructService>(RebuildStructService);

  let configService = moduleRef.get<ConfigService>(ConfigService);
  let blockmlLogsPath = configService.get<interfaces.Config['blockmlLogsPath']>(
    'blockmlLogsPath'
  );
  let blockmlCopyLogsToModels = configService.get<
    interfaces.Config['blockmlCopyLogsToModels']
  >('blockmlCopyLogsToModels');

  let funcArray = func.toString().split('/');

  let pack = funcArray[0];
  let f = funcArray[1];

  let traceId = '123';

  let structId = helper.isDefined(connection)
    ? `${caller}/${f}/${testId}/${connection.type}`
    : `${caller}/${f}/${testId}`;

  let fromDir = `${blockmlLogsPath}/${caller}/${f}/${structId}`;
  fse.emptyDirSync(fromDir);

  let dataDir = `${constants.SRC_PATH}/models/${pack}/tests/${f}/data/${testId}`;

  let toDir =
    blockmlCopyLogsToModels === api.BoolEnum.FALSE
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
