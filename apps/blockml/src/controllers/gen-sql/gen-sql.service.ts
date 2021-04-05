import { Injectable } from '@nestjs/common';
import { apiToBlockml } from '~blockml/barrels/api-to-blockml';
import { barSpecial } from '~blockml/barrels/bar-special';
import { common } from '~blockml/barrels/common';

@Injectable()
export class GenSqlService {
  async gen(request: any) {
    if (
      request.info?.name !==
      apiToBlockml.ToBlockmlWorkerRequestInfoNameEnum.ToBlockmlWorkerGenSql
    ) {
      throw new common.ServerError({
        message: apiToBlockml.ErEnum.BLOCKML_WORKER_WRONG_REQUEST_INFO_NAME
      });
    }

    let reqValid = await common.transformValid({
      classType: apiToBlockml.ToBlockmlWorkerGenSqlRequest,
      object: request,
      errorMessage: apiToBlockml.ErEnum.BLOCKML_WORKER_WRONG_REQUEST_PARAMS
    });

    let payload = barSpecial.genSqlPro(reqValid.payload);

    return payload;
  }
}