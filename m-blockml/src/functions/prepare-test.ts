import { Test, TestingModule } from '@nestjs/testing';
import { StructService } from '../services/struct.service';
import * as fse from 'fs-extra';
import { enums } from 'src/barrels/enums';

export async function prepareTest(item: {
  pack: enums.PackEnum;
  caller: enums.CallerEnum;
  func: enums.FuncEnum;
  testId: string;
}) {
  let { pack, caller, func, testId } = item;

  let structId = `${caller}/${func}/${testId}`;

  let logsDir = `src/logs/${caller}/${func}/${structId}`;

  fse.emptyDirSync(logsDir);

  let dataDir = `src/models/${pack}/tests/${func}/data/${testId}`;

  let moduleRef: TestingModule = await Test.createTestingModule({
    controllers: [],
    providers: [StructService]
  }).compile();

  let structService = moduleRef.get<StructService>(StructService);

  return {
    structService: structService,
    dataDir: dataDir,
    logPath: logsDir,
    structId: structId
  };
}
