import { ConfigService } from '@nestjs/config';
import { BlockmlConfig } from '~blockml/config/blockml-config';
import { BmError } from '~blockml/models/bm-error';
import {
  METRIC_ID_BY,
  MF,
  MPROVE_TAG_FIELD_GROUP
} from '~common/constants/top';
import { FieldClassEnum } from '~common/enums/field-class.enum';
import { FieldResultEnum } from '~common/enums/field-result.enum';
import { MetricTypeEnum } from '~common/enums/metric-type.enum';
import { ModelTypeEnum } from '~common/enums/model-type.enum';
import { CallerEnum } from '~common/enums/special/caller.enum';
import { FuncEnum } from '~common/enums/special/func.enum';
import { LogTypeEnum } from '~common/enums/special/log-type.enum';
import { capitalizeFirstLetter } from '~common/functions/capitalize-first-letter';
import { isDefined } from '~common/functions/is-defined';
import { isUndefined } from '~common/functions/is-undefined';
import { FileStore } from '~common/interfaces/blockml/internal/file-store';
import { Model } from '~common/interfaces/blockml/model';
import { ModelMetric } from '~common/interfaces/blockml/model-metric';
import { log } from '../extra/log';

let func = FuncEnum.CreateModelMetrics;

export function createModelMetrics(
  item: {
    apiModels: Model[];
    stores: FileStore[];
    errors: BmError[];
    structId: string;
    caller: CallerEnum;
  },
  cs: ConfigService<BlockmlConfig>
) {
  let { caller, structId } = item;
  log(cs, caller, func, structId, LogTypeEnum.Input, item);

  let modelMetrics: ModelMetric[] = [];

  item.stores.forEach(store => {
    if (isUndefined(store.build_metrics) || store.build_metrics.length === 0) {
      return;
    }

    store.build_metrics.forEach(buildMetricElement => {
      let storeFieldTimeGroup = store.field_time_groups.find(
        ftg => ftg.time === buildMetricElement.time
      );

      let storeFieldGroup = isDefined(storeFieldTimeGroup.group)
        ? store.field_groups.find(fg => fg.group === storeFieldTimeGroup.group)
        : undefined;

      let timeId = storeFieldTimeGroup.time;

      let timeNodeLabel: string;
      let timeFieldLabel: string;
      let timeLabel: string;

      if (isUndefined(storeFieldTimeGroup.group)) {
        timeNodeLabel = store.label; // 'Model Fields'
        timeFieldLabel = storeFieldTimeGroup.label;
        timeLabel = `${timeNodeLabel} ${timeFieldLabel}`;
      } else {
        timeNodeLabel =
          storeFieldGroup?.label ??
          storeFieldGroup?.group
            .split('_')
            .map(k => capitalizeFirstLetter(k))
            .join(' ') ??
          store.label; // 'Model Fields'
        timeFieldLabel =
          storeFieldTimeGroup?.label || storeFieldTimeGroup?.time;
        timeLabel = `${timeNodeLabel} ${timeFieldLabel}`;
      }

      store.fields
        .filter(storeField => storeField.fieldClass === FieldClassEnum.Measure)
        .forEach(storeField => {
          // let topLabel = `Store - ${store.label}`;
          let topLabel = `${store.label}`;

          // let partId = `${storeField.name}`;

          let partNodeLabel = isDefined(storeFieldGroup)
            ? (storeFieldGroup.label ?? storeFieldGroup.group)
            : store.label; //'Model Fields'

          let partFieldLabel = storeField.label;

          let partLabel = `${partNodeLabel} ${partFieldLabel}`;

          let modelMetric: ModelMetric = {
            metricId: `${store.name}.${storeField.name}.${METRIC_ID_BY}.${timeId}`,
            filePath: store.filePath,
            fieldLineNum: storeField.name_line_num,
            // partId: partId,
            modelId: `${store.name}`,
            modelType: ModelTypeEnum.Store,
            connectionType: store.connectionType,
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
            type: MetricTypeEnum.Model,
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
    .filter(m => m.type === ModelTypeEnum.Malloy)
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
            (x.result === FieldResultEnum.Ts ||
              x.result === FieldResultEnum.Date)
        )
        .forEach(x => {
          let timeId = isDefined(x.timeframe)
            ? x.id.slice(0, -(x.timeframe.length + 1))
            : x.id.slice(0, -('ts'.length + 1));

          let fieldGroupTag = x.mproveTags.find(
            x => x.key === MPROVE_TAG_FIELD_GROUP
          );

          let timeFieldLabel =
            fieldGroupTag?.value ??
            timeId
              .split('_')
              .map(k => capitalizeFirstLetter(k))
              .join(' ');

          let xParentNode =
            x.malloyFieldPath.length > 0
              ? apiModel.nodes.find(n => n.id === x.malloyFieldPath.join('.'))
              : apiModel.nodes.find(n => n.id === MF);

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
              y.fieldClass === FieldClassEnum.Measure &&
              y.result === FieldResultEnum.Number
          )
          .forEach(y => {
            let topLabel = apiModel.label;

            let yParentNode =
              y.malloyFieldPath.length > 0
                ? apiModel.nodes.find(n => n.id === y.malloyFieldPath.join('.'))
                : apiModel.nodes.find(n => n.id === MF);

            let yNode = yParentNode.children.find(n => n.id === y.id);

            // let partId = y.id.split('.').join('_');
            let partNodeLabel = yParentNode.label;
            let partFieldLabel = y.label;
            let partLabel = `${partNodeLabel} ${partFieldLabel}`;

            let modelMetric: ModelMetric = {
              metricId: `${apiModel.modelId}.${y.id}.${METRIC_ID_BY}.${tg.timeId}`,
              filePath: yNode.fieldFilePath,
              fieldLineNum: yNode.fieldLineNum,
              // partId: partId,
              modelId: apiModel.modelId,
              modelType: ModelTypeEnum.Malloy,
              connectionType: apiModel.connectionType,
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
              type: MetricTypeEnum.Model,
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

  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);
  log(cs, caller, func, structId, LogTypeEnum.Metrics, modelMetrics);

  return modelMetrics;
}
