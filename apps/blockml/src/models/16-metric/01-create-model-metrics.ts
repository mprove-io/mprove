import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.CreateModelMetrics;

export function createModelMetrics(
  item: {
    models: common.FileModel[];
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Input, item);

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
      let timeId = element.time.split('.').join('_');

      let timeAr = element.time.split('.');
      let timeAsName = timeAr[0];
      let timeFieldName = timeAr[1];

      let timeLabel: string;

      if (timeAsName === constants.MF) {
        let timeFields: common.FieldAny[] = model.fields.filter(
          mField => mField.groupId === timeFieldName
        );

        timeLabel = `Model Fields  ${timeFields[0].group_label}`;
      } else {
        let join = model.joins.find(j => j.as === timeAsName);

        let timeFields: common.FieldAny[] = join.view.fields.filter(
          vField => vField.groupId === timeFieldName
        );

        timeLabel = `${join.label} ${timeFields[0].group_label}`;
      }

      model.fields
        .filter(y => {
          if (
            y.fieldClass === common.FieldClassEnum.Measure &&
            y.type !== common.FieldTypeEnum.List
          ) {
            return true;
          } else if (y.fieldClass === common.FieldClassEnum.Calculation) {
            let depDimensions: {
              [as: string]: { [fieldName: string]: number };
            } = {};

            let asName = constants.MF;
            let fieldName = y.name;

            Object.keys(model.fieldsDepsAfterSingles[fieldName]).forEach(
              depName => {
                let depModelField = model.fields.find(
                  mField => mField.name === depName
                );

                if (
                  depModelField.fieldClass === common.FieldClassEnum.Dimension
                ) {
                  if (common.isUndefined(depDimensions[asName])) {
                    depDimensions[asName] = {};
                  }
                  depDimensions[asName][depName] = 1;
                }
              }
            );

            Object.keys(model.fieldsDoubleDepsAfterSingles[fieldName]).forEach(
              alias => {
                Object.keys(
                  model.fieldsDoubleDepsAfterSingles[fieldName][alias]
                ).forEach(depName => {
                  let join = model.joins.find(j => j.as === alias);

                  let depViewField = join.view.fields.find(
                    vField => vField.name === depName
                  );

                  if (
                    depViewField.fieldClass === common.FieldClassEnum.Dimension
                  ) {
                    if (common.isUndefined(depDimensions[alias])) {
                      depDimensions[alias] = {};
                    }
                    depDimensions[alias][depName] = 1;
                  }
                });
              }
            );

            let depDimensionsCounter = 0;

            Object.keys(depDimensions).forEach(key => {
              Object.keys(depDimensions[key]).forEach(subKey => {
                depDimensionsCounter++;
              });
            });

            return depDimensionsCounter === 0;
          } else {
            return false;
          }
        })
        .forEach(modelField => {
          let topLabel = model.label;

          let partId = `model_fields_${modelField.name}`;
          let partLabel = `Model Fields ${modelField.label}`;

          let modelMetric: common.ModelMetric = {
            metricId: `${model.name}_${partId}_by_${timeId}`,
            filePath: model.filePath,
            partId: partId,
            modelId: model.name,
            topNode: model.name,
            topLabel: topLabel,
            fieldId: `mf.${modelField.name}`,
            fieldClass: modelField.fieldClass,
            timeFieldId: element.time,
            timeLabel: timeLabel,
            params: [],
            structId: structId,
            type: common.MetricTypeEnum.Model,
            label: `${topLabel} ${partLabel} by ${timeLabel}`,
            partLabel: partLabel,
            description: modelField.description,
            formatNumber: modelField.format_number,
            currencyPrefix: modelField.currency_prefix,
            currencySuffix: modelField.currency_suffix,
            serverTs: 1
          };

          if (errorsOnStart === item.errors.length) {
            modelMetrics.push(modelMetric);
          }
        });

      model.joins.forEach(join => {
        join.view.fields
          .filter(y => {
            if (y.fieldClass === common.FieldClassEnum.Measure) {
              return true;
            } else if (y.fieldClass === common.FieldClassEnum.Calculation) {
              let depDimensions: {
                [as: string]: { [fieldName: string]: number };
              } = {};

              let asName = join.as;
              let fieldName = y.name;

              Object.keys(join.view.fieldsDepsAfterSingles[fieldName]).forEach(
                depName => {
                  let depViewField = join.view.fields.find(
                    vField => vField.name === depName
                  );

                  if (
                    depViewField.fieldClass === common.FieldClassEnum.Dimension
                  ) {
                    if (common.isUndefined(depDimensions[asName])) {
                      depDimensions[asName] = {};
                    }
                    depDimensions[asName][depName] = 1;
                  }
                }
              );

              let depDimensionsCounter = 0;

              Object.keys(depDimensions).forEach(key => {
                Object.keys(depDimensions[key]).forEach(subKey => {
                  depDimensionsCounter++;
                });
              });

              return depDimensionsCounter === 0;
            } else {
              return false;
            }
          })
          .forEach(viewField => {
            let topLabel = model.label;

            let partId = `${join.as}_${viewField.name}`;
            let partLabel = `${join.label} ${viewField.label}`;

            let modelMetric: common.ModelMetric = {
              metricId: `${model.name}_${partId}_by_${timeId}`,
              filePath: join.view.filePath,
              partId: partId,
              modelId: model.name,
              topNode: model.name,
              topLabel: topLabel,
              fieldId: `${join.as}.${viewField.name}`,
              fieldClass: viewField.fieldClass,
              timeFieldId: element.time,
              timeLabel: timeLabel,
              params: [],
              structId: structId,
              type: common.MetricTypeEnum.Model,
              label: `${topLabel} ${partLabel} by ${timeLabel}`,
              partLabel: partLabel,
              description: viewField.description,
              formatNumber: viewField.format_number,
              currencyPrefix: viewField.currency_prefix,
              currencySuffix: viewField.currency_suffix,
              serverTs: 1
            };

            if (errorsOnStart === item.errors.length) {
              modelMetrics.push(modelMetric);
            }
          });
      });
    });
  });

  helper.log(
    cs,
    caller,
    func,
    structId,
    common.LogTypeEnum.Errors,
    item.errors
  );
  helper.log(
    cs,
    caller,
    func,
    structId,
    common.LogTypeEnum.Metrics,
    modelMetrics
  );

  return modelMetrics;
}
