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
          let partId = `model_fields_${modelField.name}`;
          let partLabel = `Model Fields ${modelField.label}`;

          let modelMetric: common.ModelMetric = {
            metricId: `${model.name}_${partId}`,
            filePath: model.filePath,
            partId: partId,
            modelId: model.name,
            topNode: model.name,
            topLabel: model.label,
            fieldId: `mf.${modelField.name}`,
            fieldClass: modelField.fieldClass,
            timeFieldId: element.time,
            params: [],
            structId: structId,
            type: common.MetricTypeEnum.Model,
            label: `${model.label} ${partLabel}`,
            partLabel: partLabel,
            description: modelField.description,
            serverTs: 1
          };

          if (errorsOnStart === item.errors.length) {
            modelMetrics.push(modelMetric);
          }
        });

      model.joins.forEach(join => {
        join.view.fields
          .filter(
            y =>
              [
                common.FieldClassEnum.Measure,
                common.FieldClassEnum.Calculation
              ].indexOf(y.fieldClass) > -1
          )
          .forEach(viewField => {
            let partId = `${join.as}_${viewField.name}`;
            let partLabel = `${join.label} ${viewField.label}`;

            let modelMetric: common.ModelMetric = {
              metricId: `${model.name}_${partId}`,
              filePath: join.view.filePath,
              partId: partId,
              modelId: model.name,
              topNode: model.name,
              topLabel: model.label,
              fieldId: `${join.as}.${viewField.name}`,
              fieldClass: viewField.fieldClass,
              timeFieldId: element.time,
              params: [],
              structId: structId,
              type: common.MetricTypeEnum.Model,
              label: `${model.label} ${partLabel}`,
              partLabel: partLabel,
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
