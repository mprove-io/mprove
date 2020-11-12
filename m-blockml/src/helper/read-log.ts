import * as fse from 'fs-extra';

import { enums } from '../barrels/enums';
import { api } from '../barrels/api';
import { interfaces } from '../barrels/interfaces';

export async function readLog(logPath: string, log: enums.LogTypeEnum) {
  let path = logPath + '/' + log;
  let buffer = fse.readFileSync(path);
  let content = buffer.toString();

  switch (log) {
    case enums.LogTypeEnum.Errors: {
      return await api.transformValidString({
        classType: interfaces.BmErrorC,
        jsonString: content,
        errorMessage: api.ErEnum.M_BLOCKML_WRONG_TEST_TRANSFORM_AND_VALIDATE
      });
    }

    default: {
      return JSON.parse(content);
    }
  }
}
