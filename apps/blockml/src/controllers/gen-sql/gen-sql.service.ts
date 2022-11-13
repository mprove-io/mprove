import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';
import { apiToBlockml } from '~blockml/barrels/api-to-blockml';
import { barSpecial } from '~blockml/barrels/bar-special';
import { common } from '~blockml/barrels/common';
import { interfaces } from '~blockml/barrels/interfaces';

@Injectable()
export class GenSqlService {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private pinoLogger: PinoLogger
  ) {}

  async gen(request: any) {
    if (
      request.info?.name !==
      apiToBlockml.ToBlockmlWorkerRequestInfoNameEnum.ToBlockmlWorkerGenSql
    ) {
      throw new common.ServerError({
        message: common.ErEnum.BLOCKML_WORKER_WRONG_REQUEST_INFO_NAME
      });
    }

    let reqValid = common.transformValidSync({
      classType: apiToBlockml.ToBlockmlWorkerGenSqlRequest,
      object: request,
      errorMessage: common.ErEnum.BLOCKML_WORKER_WRONG_REQUEST_PARAMS,
      logIsStringify: this.cs.get<interfaces.Config['blockmlLogIsStringify']>(
        'blockmlLogIsStringify'
      ),
      pinoLogger: this.pinoLogger
    });

    let payload = barSpecial.genSqlPro(reqValid.payload);

    return payload;
  }
}
