import * as fse from 'fs-extra';
import { Test, TestingModule } from '@nestjs/testing';
import { StructService } from '../services/struct.service';
import { enums } from '../barrels/enums';
import { helper } from '../barrels/helper';
import { RabbitService } from '../services/rabbit.service';
import { api } from 'src/barrels/api';

export async function prepareTest(
  caller: enums.CallerEnum,
  func: enums.FuncEnum,
  testId: string,
  connection?: api.ProjectConnection
) {
  let funcArray = func.toString().split('/');

  let pack = funcArray[0];
  let f = funcArray[1];

  let traceId = '123';

  let structId = helper.isDefined(connection)
    ? `${caller}/${f}/${testId}/${connection.type}`
    : `${caller}/${f}/${testId}`;

  let fromDir = `src/logs/${caller}/${f}/${structId}`;

  fse.emptyDirSync(fromDir);

  let dataDir = `src/models/${pack}/tests/${f}/data/${testId}`;

  let toDir = helper.isDefined(connection)
    ? `src/models/${pack}/tests/${f}/logs/${testId}/${connection.type}`
    : `src/models/${pack}/tests/${f}/logs/${testId}`;

  let moduleRef: TestingModule = await Test.createTestingModule({
    controllers: [],
    providers: [
      StructService,
      {
        provide: RabbitService,
        useValue: {}
      }
    ]
  }).compile();

  let structService = moduleRef.get<StructService>(StructService);

  return {
    structService: structService,
    traceId: traceId,
    structId: structId,
    dataDir: dataDir,
    fromDir: fromDir,
    toDir: toDir
  };
}
