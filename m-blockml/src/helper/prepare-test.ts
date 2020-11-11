import { Test, TestingModule } from '@nestjs/testing';
import { StructService } from '../services/struct.service';
import * as fse from 'fs-extra';

export async function prepareTest(pack: string, func: string, testId: string) {
  let structId = `${pack}__${func}__${testId}`;

  let structDir = `src/logs/${structId}`;

  fse.emptyDirSync(structDir);

  let dataDir = `src/models/${pack}/tests/${func}/data/${testId}`;

  let logPath = `src/logs/${structId}/${pack}/${func}`;

  let moduleRef: TestingModule = await Test.createTestingModule({
    controllers: [],
    providers: [StructService]
  }).compile();

  let structService = moduleRef.get<StructService>(StructService);

  return {
    structService: structService,
    structId: structId,
    dataDir: dataDir,
    logPath: logPath
  };
}
