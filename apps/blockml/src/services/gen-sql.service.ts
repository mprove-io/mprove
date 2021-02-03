import { Injectable } from '@nestjs/common';
import { api } from '~blockml/barrels/api';
import { barSpecial } from '~blockml/barrels/bar-special';

@Injectable()
export class GenSqlService {
  async process(request: any) {
    if (
      request.info?.name !==
      api.ToBlockmlWorkerRequestInfoNameEnum.ToBlockmlWorkerGenSql
    ) {
      throw new api.ServerError({
        message: api.ErEnum.BLOCKML_WORKER_WRONG_REQUEST_INFO_NAME
      });
    }

    let reqValid = await api.transformValid({
      classType: api.ToBlockmlWorkerGenSqlRequest,
      object: request,
      errorMessage: api.ErEnum.BLOCKML_WORKER_WRONG_REQUEST_PARAMS
    });

    let payload = barSpecial.genSqlPro(reqValid.payload);

    return payload;
  }
}
