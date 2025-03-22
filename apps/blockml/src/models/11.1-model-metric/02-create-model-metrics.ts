import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';
import { STORE_MODEL_PREFIX } from '~common/constants/top';

let func = common.FuncEnum.CreateModelMetrics;

export function createModelMetrics(
  item: {
    models: common.FileModel[];
    stores: common.FileStore[];
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Input, item);

  let modelMetrics: common.ModelMetric[] = [];

  item.stores.forEach(store => {
    if (
      common.isUndefined(store.build_metrics) ||
      store.build_metrics.length === 0
    ) {
      return;
    }

    store.build_metrics.forEach(buildMetricElement => {
      let storeFieldTimeGroup = store.field_time_groups.find(
        ftg => ftg.time === buildMetricElement.time
      );

      let storeFieldGroup = common.isDefined(storeFieldTimeGroup.group)
        ? store.field_groups.find(fg => fg.group === storeFieldTimeGroup.group)
        : undefined;

      let timeId = storeFieldTimeGroup.time;

      let timeNodeLabel: string;
      let timeFieldLabel: string;
      let timeLabel: string;

      if (common.isUndefined(storeFieldTimeGroup.group)) {
        timeNodeLabel = 'Model Fields';
        timeFieldLabel = storeFieldTimeGroup.label;
        timeLabel = `${timeNodeLabel} ${timeFieldLabel}`;
      } else {
        timeNodeLabel =
          storeFieldGroup?.label || storeFieldGroup?.group || 'Model Fields';
        timeFieldLabel =
          storeFieldTimeGroup?.label || storeFieldTimeGroup?.time;
        timeLabel = `${timeNodeLabel} ${timeFieldLabel}`;
      }

      store.fields
        .filter(
          storeField => storeField.fieldClass === common.FieldClassEnum.Measure
        )
        .forEach(storeField => {
          let topLabel = `Store Model - ${store.label}`;

          let partId = `${storeField.name}`;

          let partNodeLabel = common.isDefined(storeFieldGroup)
            ? storeFieldGroup.label || storeFieldGroup.group
            : 'Model Fields';

          let partFieldLabel = storeField.label;

          let partLabel = `${partNodeLabel} ${partFieldLabel}`;

          let modelMetric: common.ModelMetric = {
            metricId: `${STORE_MODEL_PREFIX}_${store.name}_${partId}_by_${timeId}`,
            filePath: store.filePath,
            partId: partId,
            modelId: `${STORE_MODEL_PREFIX}_${store.name}`,
            topNode: `${STORE_MODEL_PREFIX}_${store.name}`,
            topLabel: topLabel,
            fieldId: `${storeField.name}`,
            fieldClass: storeField.fieldClass,
            timeFieldId: storeFieldTimeGroup.time,
            timeNodeLabel: timeNodeLabel,
            timeFieldLabel: timeFieldLabel,
            timeLabel: timeLabel,
            structId: structId,
            type: common.MetricTypeEnum.Model,
            label: `${topLabel} ${partLabel} by ${timeLabel}`,
            partNodeLabel: partNodeLabel,
            partFieldLabel: partFieldLabel,
            partLabel: partLabel,
            description: storeField.description,
            formatNumber: storeField.format_number,
            currencyPrefix: storeField.currency_prefix,
            currencySuffix: storeField.currency_suffix,
            serverTs: 1
          };

          modelMetrics.push(modelMetric);
        });
    });
  });

  item.models.forEach(model => {
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

      let timeNodeLabel: string;
      let timeFieldLabel: string;
      let timeLabel: string;

      if (timeAsName === common.MF) {
        let timeFields: common.FieldAny[] = model.fields.filter(
          mField => mField.groupId === timeFieldName
        );

        timeNodeLabel = 'Model Fields';
        timeFieldLabel = timeFields[0].group_label;
        timeLabel = `${timeNodeLabel} ${timeFieldLabel}`;
      } else {
        let join = model.joins.find(j => j.as === timeAsName);

        let timeFields: common.FieldAny[] = join.view.fields.filter(
          vField => vField.groupId === timeFieldName
        );

        timeNodeLabel = join.label;
        timeFieldLabel = timeFields[0].group_label;
        timeLabel = `${timeNodeLabel} ${timeFieldLabel}`;
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

            let asName = common.MF;
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

          let partNodeLabel = 'Model Fields';
          let partFieldLabel = modelField.label;
          let partLabel = `${partNodeLabel} ${partFieldLabel}`;

          let modelMetric: common.ModelMetric = {
            metricId: `${model.name}_${partId}_by_${timeId}`,
            filePath: model.filePath,
            partId: partId,
            modelId: model.name,
            topNode: model.name,
            topLabel: topLabel,
            fieldId: `${common.MF}.${modelField.name}`,
            fieldClass: modelField.fieldClass,
            timeFieldId: element.time,
            timeNodeLabel: timeNodeLabel,
            timeFieldLabel: timeFieldLabel,
            timeLabel: timeLabel,
            structId: structId,
            type: common.MetricTypeEnum.Model,
            label: `${topLabel} ${partLabel} by ${timeLabel}`,
            partNodeLabel: partNodeLabel,
            partFieldLabel: partFieldLabel,
            partLabel: partLabel,
            description: modelField.description,
            formatNumber: modelField.format_number,
            currencyPrefix: modelField.currency_prefix,
            currencySuffix: modelField.currency_suffix,
            serverTs: 1
          };

          modelMetrics.push(modelMetric);
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

            let partNodeLabel = join.label;
            let partFieldLabel = viewField.label;
            let partLabel = `${partNodeLabel} ${partFieldLabel}`;

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
              timeNodeLabel: timeNodeLabel,
              timeFieldLabel: timeFieldLabel,
              timeLabel: timeLabel,
              structId: structId,
              type: common.MetricTypeEnum.Model,
              label: `${topLabel} ${partLabel} by ${timeLabel}`,
              partNodeLabel: partNodeLabel,
              partFieldLabel: partFieldLabel,
              partLabel: partLabel,
              description: viewField.description,
              formatNumber: viewField.format_number,
              currencyPrefix: viewField.currency_prefix,
              currencySuffix: viewField.currency_suffix,
              serverTs: 1
            };

            modelMetrics.push(modelMetric);
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
