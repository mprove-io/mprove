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

  item.models.forEach(model => {
    let errorsOnStart = item.errors.length;

    if (
      common.isUndefined(model.build_metrics) ||
      model.build_metrics.length === 0
    ) {
      return;
    }

    model.build_metrics.forEach(element => {
      model.fields
        .filter(
          y =>
            [
              common.FieldClassEnum.Measure,
              common.FieldClassEnum.Calculation
            ].indexOf(y.fieldClass) > -1
        )
        .forEach(modelField => {
          let modelMetric: common.ModelMetric = {
            metricId: `${model.name}_model_fields_${modelField.name}`,
            modelId: model.name,
            topNode: model.name,
            fieldId: `mf.${modelField.name}`,
            timeFieldId: element.time,
            fixedParameters: [],
            structId: structId,
            type: common.MetricTypeEnum.Model,
            label: `${model.label} Model Fields ${modelField.label}`,
            hidden: helper.toBooleanFromLowercaseString(modelField.hidden),
            description: modelField.description,
            serverTs: 1
          };

          if (errorsOnStart === item.errors.length) {
            modelMetrics.push(modelMetric);
          }
        });

      model.joins.forEach(join => {
        join.view.fields.forEach(viewField => {
          let modelMetric: common.ModelMetric = {
            metricId: `${model.name}_${join.as}_${viewField.name}`,
            modelId: model.name,
            topNode: model.name,
            fieldId: `${join.as}.${viewField.name}`,
            timeFieldId: element.time,
            fixedParameters: [],
            structId: structId,
            type: common.MetricTypeEnum.Model,
            label: `${model.label} ${join.label} ${viewField.label}`,
            hidden: helper.toBooleanFromLowercaseString(viewField.hidden),
            description: viewField.description,
            serverTs: 1
          };

          if (errorsOnStart === item.errors.length) {
            modelMetrics.push(modelMetric);
          }
        });
      });
    });
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
