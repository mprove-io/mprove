import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToBlockml } from '~blockml/barrels/api-to-blockml';
import { common } from '~blockml/barrels/common';
import { interfaces } from '~blockml/barrels/interfaces';
import { nodeCommon } from '~blockml/barrels/node-common';
import { bricksToFractions } from '~node-common/functions/bricks-to-fractions';

@Injectable()
export class GetTimeRangeService {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private logger: Logger
  ) {}

  async get(request: any) {
    if (
      request.info?.name !==
      apiToBlockml.ToBlockmlRequestInfoNameEnum.ToBlockmlGetTimeRange
    ) {
      throw new common.ServerError({
        message: common.ErEnum.BLOCKML_WRONG_REQUEST_INFO_NAME
      });
    }

    let reqValid = nodeCommon.transformValidSync({
      classType: apiToBlockml.ToBlockmlGetTimeRangeRequest,
      object: request,
      errorMessage: common.ErEnum.BLOCKML_WRONG_REQUEST_PARAMS,
      logIsJson:
        this.cs.get<interfaces.Config['blockmlLogIsJson']>('blockmlLogIsJson'),
      logger: this.logger
    });

    let {
      timeRangeFractionBrick,
      timezone,
      weekStart,
      caseSensitiveStringFilters
    } = reqValid.payload;

    let fractions: common.Fraction[] = [];

    let p = bricksToFractions({
      // caseSensitiveStringFilters: caseSensitiveStringFilters,
      filterBricks: [timeRangeFractionBrick],
      result: common.FieldResultEnum.Ts,
      fractions: fractions,
      getTimeRange: true,
      timezone: timezone,
      weekStart: weekStart
    });

    let timeRangeFraction = fractions[0];

    if (p.valid !== 1) {
      let payload: apiToBlockml.ToBlockmlGetTimeRangeResponsePayload = {
        isValid: false,
        rangeStart: undefined,
        rangeEnd: undefined,
        timeRangeFraction: undefined
      };

      return payload;
    }

    let payload: apiToBlockml.ToBlockmlGetTimeRangeResponsePayload = {
      isValid: p.valid === 1,
      rangeStart: p.rangeStart,
      rangeEnd: p.rangeEnd,
      timeRangeFraction: timeRangeFraction
    };

    return payload;
  }
}
