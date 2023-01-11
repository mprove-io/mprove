import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = enums.FuncEnum.CreateModelMetrics;

export function createModelMetrics(
  item: {
    models: interfaces.Model[];
    errors: BmError[];
    structId: string;
    caller: enums.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Input, item);

  let modelMetrics: common.ModelMetric[] = [];

  item.models.forEach(x => {
    let errorsOnStart = item.errors.length;

    x.fields.forEach(fields => {});
    x.joins.forEach(join => {});

    let modelMetric: common.ModelMetric;

    if (errorsOnStart === item.errors.length) {
      modelMetrics.push(modelMetric);
    }
  });

  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(
    cs,
    caller,
    func,
    structId,
    enums.LogTypeEnum.Metrics,
    modelMetrics
  );

  return modelMetrics;
}
