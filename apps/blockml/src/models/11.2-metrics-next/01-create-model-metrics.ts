import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';
import { METRIC_ID_BY } from '~common/constants/top';

let func = common.FuncEnum.CreateModelMetrics;

export function createModelMetrics(
  item: {
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

          // let partId = `${storeField.name}`;

          let partNodeLabel = common.isDefined(storeFieldGroup)
            ? (storeFieldGroup.label ?? storeFieldGroup.group)
            : store.label; //'Model Fields'

          let partFieldLabel = storeField.label;

          let partLabel = `${partNodeLabel} ${partFieldLabel}`;

          let modelMetric: common.ModelMetric = {
            metricId: `${store.name}.${storeField.name}.${METRIC_ID_BY}.${timeId}`,
            filePath: store.filePath,
            // partId: partId,
            modelId: `${store.name}`,
            modelType: common.ModelTypeEnum.Store,
            topNode: `${store.name}`,
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

            // let partId = y.id.split('.').join('_');
            let partNodeLabel = yParentNode.label;
            let partFieldLabel = y.label;
            let partLabel = `${partNodeLabel} ${partFieldLabel}`;

            let modelMetric: common.ModelMetric = {
              metricId: `${apiModel.modelId}.${y.id}.${METRIC_ID_BY}.${tg.timeId}`,
              filePath: yNode.fieldFilePath,
              // partId: partId,
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
