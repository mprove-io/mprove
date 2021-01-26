import { Injectable } from '@nestjs/common';
import { api } from '~/barrels/api';
import { barSpecial } from '~/barrels/bar-special';

@Injectable()
export class GenSqlService {
  async process(request: any) {
    if (
      request.info?.name !==
      api.ToBlockmlWorkerRequestInfoNameEnum.ToBlockmlWorkerGenSql
    ) {
      throw new api.ServerError({
        message: api.ErEnum.M_BLOCKML_WORKER_WRONG_REQUEST_INFO_NAME
      });
    }

    let reqValid = await api.transformValid({
      classType: api.ToBlockmlWorkerGenSqlRequest,
      object: request,
      errorMessage: api.ErEnum.M_BLOCKML_WORKER_WRONG_REQUEST_PARAMS
    });

    let payload = barSpecial.genSqlPro(reqValid.payload);

    return payload;
  }
}
