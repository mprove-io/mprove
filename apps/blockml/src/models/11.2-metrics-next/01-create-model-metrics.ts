import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';
import { METRIC_ID_BY, STORE_MODEL_PREFIX } from '~common/constants/top';

let func = common.FuncEnum.CreateModelMetrics;

export function createModelMetrics(
  item: {
    models: common.FileModel[];
    apiModels: common.Model[];
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
        timeNodeLabel = store.label; // 'Model Fields'
        timeFieldLabel = storeFieldTimeGroup.label;
        timeLabel = `${timeNodeLabel} ${timeFieldLabel}`;
      } else {
        timeNodeLabel =
          storeFieldGroup?.label ??
          storeFieldGroup?.group
            .split('_')
            .map(k => common.capitalizeFirstLetter(k))
            .join(' ') ??
          store.label; // 'Model Fields'
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
            ? (storeFieldGroup.label ?? storeFieldGroup.group)
            : store.label; //'Model Fields'

          let partFieldLabel = storeField.label;

          let partLabel = `${partNodeLabel} ${partFieldLabel}`;

          let modelMetric: common.ModelMetric = {
            metricId: `${STORE_MODEL_PREFIX}_${store.name}.${partId}.${METRIC_ID_BY}.${timeId}`,
            filePath: store.filePath,
            partId: partId,
            modelId: `${STORE_MODEL_PREFIX}_${store.name}`,
            modelType: common.ModelTypeEnum.Store,
            topNode: `${STORE_MODEL_PREFIX}_${store.name}`,
            topLabel: topLabel,
            fieldId: `${storeField.name}`,
            fieldClass: storeField.fieldClass,
            fieldResult: storeField.result,
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

  item.apiModels
    .filter(m => m.type === common.ModelTypeEnum.Malloy)
    .forEach(apiModel => {
      let timeGroups: {
        timeId: string;
        timeNodeLabel: string;
        timeFieldLabel: string;
        timeLabel: string;
      }[] = [];

      apiModel.fields
        .filter(
          x =>
            x.buildMetrics === true &&
            // common.isDefined(x.timeframe) && // timestamp does not have timeframe
            (x.result === common.FieldResultEnum.Ts ||
              x.result === common.FieldResultEnum.Date)
        )
        .forEach(x => {
          let timeId = common.isDefined(x.timeframe)
            ? x.id.slice(0, -(x.timeframe.length + 1))
            : x.id.slice(0, -('ts'.length + 1));

          let fieldGroupTag = x.mproveTags.find(
            x => x.key === common.MPROVE_TAG_FIELD_GROUP
          );

          let timeFieldLabel =
            fieldGroupTag?.value ??
            timeId
              .split('_')
              .map(k => common.capitalizeFirstLetter(k))
              .join(' ');

          let xParentNode =
            x.malloyFieldPath.length > 0
              ? apiModel.nodes.find(n => n.id === x.malloyFieldPath.join('.'))
              : apiModel.nodes.find(n => n.id === common.MF);

          // let xNode = xParentNode.children.find(n => n.id === x.id);

          let timeNodeLabel: string = xParentNode?.label;

          let timeLabel = `${timeNodeLabel} ${timeFieldLabel}`;

          if (timeGroups.map(tg => tg.timeId).indexOf(timeId) < 0) {
            timeGroups.push({
              timeId: timeId,
              timeNodeLabel: timeNodeLabel,
              timeFieldLabel: timeFieldLabel,
              timeLabel: timeLabel
            });
          }
        });

      timeGroups.forEach(tg => {
        apiModel.fields
          .filter(
            y =>
              y.fieldClass === common.FieldClassEnum.Measure &&
              y.result === common.FieldResultEnum.Number
          )
          .forEach(y => {
            let topLabel = apiModel.label;

            let yParentNode =
              y.malloyFieldPath.length > 0
                ? apiModel.nodes.find(n => n.id === y.malloyFieldPath.join('.'))
                : apiModel.nodes.find(n => n.id === common.MF);

            let yNode = yParentNode.children.find(n => n.id === y.id);

            let partId = y.id.split('.').join('_');
            let partNodeLabel = yParentNode.label;
            let partFieldLabel = y.label;
            let partLabel = `${partNodeLabel} ${partFieldLabel}`;

            let modelMetric: common.ModelMetric = {
              metricId: `${apiModel.modelId}.${partId}.${METRIC_ID_BY}.${tg.timeId}`,
              filePath: yNode.fieldFilePath,
              partId: partId,
              modelId: apiModel.modelId,
              modelType: common.ModelTypeEnum.Malloy,
              topNode: apiModel.modelId,
              topLabel: topLabel,
              fieldId: y.id,
              fieldClass: y.fieldClass,
              fieldResult: y.result,
              timeFieldId: tg.timeId,
              timeNodeLabel: tg.timeNodeLabel,
              timeFieldLabel: tg.timeFieldLabel,
              timeLabel: tg.timeLabel,
              structId: structId,
              type: common.MetricTypeEnum.Model,
              label: `${topLabel} ${partLabel} by ${tg.timeLabel}`,
              partNodeLabel: partNodeLabel,
              partFieldLabel: partFieldLabel,
              partLabel: partLabel,
              description: y.description,
              formatNumber: y.formatNumber,
              currencyPrefix: y.currencyPrefix,
              currencySuffix: y.currencySuffix,
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

        timeNodeLabel = model.label; // 'Model Fields'
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
            y.result === common.FieldResultEnum.Number
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

          let partId = `${modelField.name}`; // model_fields

          let partNodeLabel = model.label; // 'Model Fields';
          let partFieldLabel = modelField.label;
          let partLabel = `${partNodeLabel} ${partFieldLabel}`;

          let modelMetric: common.ModelMetric = {
            metricId: `${model.name}.${partId}.${METRIC_ID_BY}.${timeId}`,
            filePath: model.filePath,
            partId: partId,
            modelId: model.name,
            modelType: common.ModelTypeEnum.SQL,
            topNode: model.name,
            topLabel: topLabel,
            fieldId: `${common.MF}.${modelField.name}`,
            fieldClass: modelField.fieldClass,
            fieldResult: modelField.result,
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
              metricId: `${model.name}.${partId}.${METRIC_ID_BY}.${timeId}`,
              filePath: join.view.filePath,
              partId: partId,
              modelId: model.name,
              modelType: common.ModelTypeEnum.SQL,
              topNode: model.name,
              topLabel: topLabel,
              fieldId: `${join.as}.${viewField.name}`,
              fieldClass: viewField.fieldClass,
              fieldResult: viewField.result,
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
