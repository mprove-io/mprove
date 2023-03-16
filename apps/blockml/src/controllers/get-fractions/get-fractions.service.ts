import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToBlockml } from '~blockml/barrels/api-to-blockml';
import { common } from '~blockml/barrels/common';
import { interfaces } from '~blockml/barrels/interfaces';
import { nodeCommon } from '~blockml/barrels/node-common';
import { processFilter } from '~blockml/models/special/process-filter';

@Injectable()
export class GetFractionsService {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private logger: Logger
  ) {}

  async get(request: any) {
    if (
      request.info?.name !==
      apiToBlockml.ToBlockmlRequestInfoNameEnum.ToBlockmlGetFractions
    ) {
      throw new common.ServerError({
        message: common.ErEnum.BLOCKML_WRONG_REQUEST_INFO_NAME
      });
    }

    let reqValid = nodeCommon.transformValidSync({
      classType: apiToBlockml.ToBlockmlGetFractionsRequest,
      object: request,
      errorMessage: common.ErEnum.BLOCKML_WRONG_REQUEST_PARAMS,
      logIsJson:
        this.cs.get<interfaces.Config['blockmlLogIsJson']>('blockmlLogIsJson'),
      logger: this.logger
    });

    let { bricks, result } = reqValid.payload;

    let fractions: common.Fraction[] = [];

    let p = processFilter({
      filterBricks: bricks,
      result: result,
      fractions: fractions,
      getTimeRange: false
    });

    if (p.valid !== 1) {
      let payload: apiToBlockml.ToBlockmlGetFractionsResponsePayload = {
        isValid: false,
        fractions: undefined
      };

      return payload;
    }

    let payload: apiToBlockml.ToBlockmlGetFractionsResponsePayload = {
      isValid: p.valid === 1,
      fractions: fractions
    };

    return payload;
  }
}
