import { Injectable } from '@nestjs/common';
import { api } from '~/barrels/api';
import { enums } from '~/barrels/enums';
import { interfaces } from '~/barrels/interfaces';
import { barSpecial } from '~/barrels/bar-special';
import { helper } from '~/barrels/helper';
import { RabbitService } from './rabbit.service';
import { ConfigService } from '@nestjs/config';

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
