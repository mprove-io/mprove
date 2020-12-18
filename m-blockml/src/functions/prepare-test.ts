import * as fse from 'fs-extra';
import { Test, TestingModule } from '@nestjs/testing';
import { StructService } from '../services/struct.service';
import { enums } from '../barrels/enums';
import { RabbitService } from '../services/rabbit.service';

export async function prepareTest(
  caller: enums.CallerEnum,
  func: enums.FuncEnum,
  testId: string
) {
  // let { caller, func, testId } = item;

  let funcArray = func.toString().split('/');

  let pack = funcArray[0];
  let f = funcArray[1];

  let traceId = '123';

  let structId = `${caller}/${f}/${testId}`;

  let fromDir = `src/logs/${caller}/${f}/${structId}`;

  fse.emptyDirSync(fromDir);

  let dataDir = `src/models/${pack}/tests/${f}/data/${testId}`;
  let toDir = `src/models/${pack}/tests/${f}/logs/${testId}`;

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
