import type { ConfigService } from '@nestjs/config';
import type { BmError } from '#blockml/classes/bm-error/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { log } from '#blockml/functions/log/log';
import {
  METRIC_ID_BY,
  MF,
  MPROVE_TAG_FIELD_GROUP
} from '#common/constants/top';
import { capitalizeFirstLetter } from '#common/functions/capitalize-first-letter/capitalize-first-letter';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { Caller } from '#common/types/blockml/diagnostics/caller';
import type { Func } from '#common/types/blockml/diagnostics/func';
import type { FileStore } from '#common/types/blockml/parts/internal/file-store';
import type { Model } from '#common/types/blockml/parts/model/model';
import type { ModelMetric } from '#common/types/blockml/parts/model/model-metric';
import {
  type FindModelNodeOutput,
  findModelNodeRecursive
} from './find-model-node-recursive/find-model-node-recursive';

let func: Func = 'build-metrics-next/create-model-metrics';

export function createModelMetrics(
  item: {
    apiModels: Model[];
    stores: FileStore[];
    errors: BmError[];
    structId: string;
    caller: Caller;
  },
  cs: ConfigService<BlockmlConfig>
) {
  let { caller, structId } = item;
  log(cs, caller, func, structId, 'input.log', item);

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
        .filter(storeField => storeField.fieldClass === 'measure')
        .forEach(storeField => {
          let topLabel = `${store.label}`;

          let partNodeLabel = isDefined(storeFieldGroup)
            ? (storeFieldGroup.label ?? storeFieldGroup.group)
            : store.label; //'Model Fields'

          let partFieldLabel = storeField.label;

          let partLabel = `${partNodeLabel} ${partFieldLabel}`;

          let modelMetric: ModelMetric = {
            metricId: `${store.name}.${storeField.name}.${METRIC_ID_BY}.${timeId}`,
            filePath: store.filePath,
            fieldLineNum: storeField.name_line_num,
            modelId: `${store.name}`,
            modelType: 'Store',
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
            type: 'Model',
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
    .filter(m => m.type === 'Malloy')
    .forEach(apiModel => {
      let timeGroups: {
        timeId: string;
        timeNodeLabel: string;
        timeFieldLabel: string;
        timeLabel: string;
      }[] = [];

      apiModel.fields
        .filter(
          x => x.buildMetrics === true && x.id.endsWith('_ts')
          // &&
          // (x.result === 'ts' ||
          //   x.result === 'date')
        )
        .forEach(x => {
          let timeId =
            // isDefined(x.timeframe)
            //   ? x.id.slice(0, -(x.timeframe.length + 1))
            //   :
            x.id.slice(0, -('ts'.length + 1));

          let fieldGroupTag = x.mproveTags.find(
            x => x.key === MPROVE_TAG_FIELD_GROUP
          );

          let timeFieldLabel =
            fieldGroupTag?.value ??
            timeId
              .split('_')
              .map(k => capitalizeFirstLetter(k))
              .join(' ');

          let xTopNode =
            x.malloyFieldPath.length > 0
              ? apiModel.nodes.find(n => n.id === x.malloyFieldPath.join('.'))
              : apiModel.nodes.find(n => n.id === MF);

          let xNodeResult: FindModelNodeOutput = findModelNodeRecursive({
            nodes: apiModel.nodes,
            nodeId: x.id,
            parentNode: xTopNode
          });

          let xParentNode = xNodeResult?.parentNode ?? xTopNode;
          let xTimeNode = xParentNode;
          let fieldGroupTagIsDefined = isDefined(fieldGroupTag);
          let xParentNodeIsDefined = isDefined(xParentNode);

          if (fieldGroupTagIsDefined && xParentNodeIsDefined) {
            let xTimeGroupNodeResult: FindModelNodeOutput =
              findModelNodeRecursive({
                nodes: apiModel.nodes,
                nodeId: xParentNode.id,
                parentNode: xTopNode
              });

            xTimeNode = xTimeGroupNodeResult?.parentNode ?? xTopNode;
          }

          let timeNodeLabel = xTimeNode?.label ?? apiModel.label;

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
          .filter(y => y.fieldClass === 'measure' && y.result === 'number')
          .forEach(y => {
            let topLabel = apiModel.label;

            let yTopNode =
              y.malloyFieldPath.length > 0
                ? apiModel.nodes.find(n => n.id === y.malloyFieldPath.join('.'))
                : apiModel.nodes.find(n => n.id === MF);

            let yNodeResult: FindModelNodeOutput = findModelNodeRecursive({
              nodes: apiModel.nodes,
              nodeId: y.id,
              parentNode: yTopNode
            });

            let yParentNode = yNodeResult?.parentNode ?? yTopNode;

            let partNodeLabel = yParentNode?.label ?? apiModel.label;
            let partFieldLabel = y.label;
            let partLabel = `${partNodeLabel} ${partFieldLabel}`;

            let modelMetric: ModelMetric = {
              metricId: `${apiModel.modelId}.${y.id}.${METRIC_ID_BY}.${tg.timeId}`,
              filePath: y.fieldFilePath,
              fieldLineNum: y.fieldLineNum,
              modelId: apiModel.modelId,
              modelType: 'Malloy',
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
              type: 'Model',
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

  log(cs, caller, func, structId, 'out_errors.log', item.errors);
  log(cs, caller, func, structId, 'out_metrics.log', modelMetrics);

  return modelMetrics;
}
