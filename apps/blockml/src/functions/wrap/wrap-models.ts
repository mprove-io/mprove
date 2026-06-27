import type { ModelDef as MalloyModelDef } from '@malloydata/malloy';
import type { ModelEntryValueWithSource } from '@malloydata/malloy-interfaces';
import { MF, UNCATEGORIZED_SPACE_TITLE } from '#common/constants/top';
import { ParameterEnum } from '#common/enums/docs/parameter.enum';
import { FieldClassEnum } from '#common/enums/field-class.enum';
import { FieldResultEnum } from '#common/enums/field-result.enum';
import { FileExtensionEnum } from '#common/enums/file-extension.enum';
import { ModelNodeIdSuffixEnum } from '#common/enums/model-node-id-suffix.enum';
import { ModelNodeLabelEnum } from '#common/enums/model-node-label.enum';
import { ModelTypeEnum } from '#common/enums/model-type.enum';
import { capitalizeFirstLetter } from '#common/functions/capitalize-first-letter';
import { isDefined } from '#common/functions/is-defined';
import { isUndefined } from '#common/functions/is-undefined';
import { parseTags } from '#common/functions/parse-tags';
import { toBooleanFromLowercaseString } from '#common/functions/to-boolean-from-lowercase-string';
import type { BmlFile } from '#common/zod/blockml/bml-file';
import type { FileMod } from '#common/zod/blockml/internal/file-mod';
import type { FilePartSpace } from '#common/zod/blockml/internal/file-part-space';
import type { FileStore } from '#common/zod/blockml/internal/file-store';
import type { KeyValuePair } from '#common/zod/blockml/key-value-pair';
import type { Model } from '#common/zod/blockml/model';
import type { ModelField } from '#common/zod/blockml/model-field';
import type { ModelNode } from '#common/zod/blockml/model-node';
import { applyTreeDoubleUnderscore } from './apply-tree-double-underscore';
import { wrapField } from './wrap-field';
import { wrapFlatMalloyFieldItem } from './wrap-malloy-field-item';
// import fse from 'fs-extra';

export function wrapModels(item: {
  projectId: string;
  structId: string;
  stores: FileStore[];
  mods: FileMod[];
  spaces: FilePartSpace[];
  files: BmlFile[];
}): Model[] {
  let { projectId, structId, stores, mods, spaces, files } = item;

  let apiModels: Model[] = [];

  [...stores, ...mods].forEach(x => {
    let modelType =
      x.fileExt === FileExtensionEnum.Store
        ? ModelTypeEnum.Store
        : x.fileExt === FileExtensionEnum.Malloy
          ? ModelTypeEnum.Malloy
          : undefined;

    let apiFields: ModelField[] = [];
    let nodes: ModelNode[] = [];

    let malloyModelDef: MalloyModelDef;
    let malloySourceInfo: ModelEntryValueWithSource;
    let mproveTags = [];
    let malloyTags = [];
    let labelTag: KeyValuePair;
    let topLabelTag: KeyValuePair;
    let treeDoubleUnderscore = false;

    if (modelType === ModelTypeEnum.Malloy) {
      {
        // model fields scope

        malloyModelDef = (x as FileMod).malloyModel._modelDef;
        malloySourceInfo = (x as FileMod).valueWithSourceInfo;

        let tagsResult = parseTags({
          inputs: malloySourceInfo.annotations?.map(x => x.value) || []
        });

        mproveTags = tagsResult.mproveTags;
        malloyTags = tagsResult.malloyTags;

        labelTag = mproveTags.find(tag => tag.key === ParameterEnum.Label);
        topLabelTag = mproveTags.find(
          tag => tag.key === ParameterEnum.TopLabel
        );
        treeDoubleUnderscore = mproveTags.some(
          tag => tag.key === ParameterEnum.TreeDoubleUnderscore
        );

        let flatMalloyFieldItems = (x as FileMod).flatMalloyFieldItems;

        if (isUndefined(flatMalloyFieldItems)) {
          return;
        }

        let filteredFlatFieldItems = flatMalloyFieldItems.filter(
          fieldItem =>
            ['dimension', 'measure'].indexOf(fieldItem.field.kind) > -1
        );

        let topIds = filteredFlatFieldItems.map(y => {
          return y.path.length === 0 ? MF : y.path.join('.');
        });

        let uniqueTopIds = [...new Set(topIds)];

        uniqueTopIds.forEach(topId => {
          let topNode: ModelNode = {
            id: topId,
            label:
              topId === MF // ModelNodeLabelEnum.ModelFields
                ? modelType === ModelTypeEnum.Malloy &&
                  isDefined(topLabelTag?.value)
                  ? topLabelTag?.value.trim()
                  : x.label
                : topId
                    .split('.')
                    .map(k => capitalizeFirstLetter(k))
                    .join(' - ')
                    .split('_')
                    .map(k => capitalizeFirstLetter(k))
                    .join(' '),
            description: undefined,
            hidden: false,
            required: false,
            isField: false,
            children: [],
            nodeClass: FieldClassEnum.Join
          };

          let nodeFlatMalloyFieldItems = filteredFlatFieldItems.filter(y => {
            if (topId === MF) {
              return y.path.length === 0;
            } else {
              return y.path.join('.') === topId;
            }
          });

          nodeFlatMalloyFieldItems.forEach(flatMalloyFieldItem => {
            let apiField: ModelField = wrapFlatMalloyFieldItem({
              flatMalloyFieldItem: flatMalloyFieldItem,
              alias: topId,
              fileName: x.fileName,
              topNode: topNode
            });

            if (
              [
                FieldResultEnum.String,
                FieldResultEnum.Number,
                FieldResultEnum.Boolean,
                FieldResultEnum.Ts
              ].indexOf(apiField.result) > -1
            ) {
              apiFields.push(apiField);
            }
          });

          if (topNode.children?.length > 0) {
            nodes.push(topNode);
          }
        });

        if (treeDoubleUnderscore === true) {
          nodes = applyTreeDoubleUnderscore({ nodes: nodes });
        }
      }
    }

    if (modelType === ModelTypeEnum.Store) {
      {
        // model fields scope

        let topNode: ModelNode = {
          id: MF,
          label: x.label, // ModelNodeLabelEnum.ModelFields
          description: undefined,
          hidden: false,
          required: false,
          isField: false,
          children: [],
          nodeClass: FieldClassEnum.Join
        };

        (x as FileStore).fields
          .filter(field => field.group === MF)
          .forEach(field => {
            let apiField: ModelField = wrapField({
              isStoreModel: x.fileExt === FileExtensionEnum.Store,
              topNode: topNode,
              field: field,
              alias: MF,
              filePath: x.filePath,
              fileName: x.fileName
            });

            apiFields.push(apiField);
          });

        if ((x as FileStore).fields.length > 0) {
          nodes.push(topNode);
        }
      }

      (x as FileStore).field_groups.forEach(fieldGroup => {
        let topNode: ModelNode = {
          id: fieldGroup.group, // join.as,
          label: fieldGroup.label || fieldGroup.group, // join.label, TODO: field_group label
          description: undefined, //join.description, TODO: field_group description
          hidden: false, // joinHidden,
          required: false,
          isField: false,
          children: [],
          nodeClass: FieldClassEnum.Join,
          viewFilePath: undefined, // join.view.filePath,
          viewName: undefined // join.view.name
        };

        let fieldGroupFields = (x as FileStore).fields.filter(
          f => f.group === fieldGroup.group
        );

        fieldGroupFields.forEach(field => {
          let apiField: ModelField = wrapField({
            isStoreModel: x.fileExt === FileExtensionEnum.Store,
            field: field,
            alias: fieldGroup.group,
            filePath: x.filePath,
            fileName: x.fileName,
            topNode: topNode
          });

          apiFields.push(apiField);
        });

        if (fieldGroupFields.length > 0) {
          nodes.push(topNode);
        }
      });
    }

    nodes.forEach(node => {
      if (isDefined(node.children)) {
        let filters: ModelNode[] = [];
        let dimensions: ModelNode[] = [];
        let measures: ModelNode[] = [];
        let calculations: ModelNode[] = [];

        node.children.forEach(n => {
          switch (true) {
            case n.nodeClass === FieldClassEnum.Filter: {
              filters.push(n);
              break;
            }

            case n.nodeClass === FieldClassEnum.Dimension: {
              dimensions.push(n);
              break;
            }

            case n.nodeClass === FieldClassEnum.Measure: {
              measures.push(n);
              break;
            }

            case n.nodeClass === FieldClassEnum.Calculation: {
              calculations.push(n);
              break;
            }
          }
        });

        let sortedFilters = filters.sort((a, b) => {
          let labelA = a.label.toUpperCase();
          let labelB = b.label.toUpperCase();
          return labelA < labelB ? -1 : labelA > labelB ? 1 : 0;
        });

        let sortedDimensions = dimensions.sort((a, b) => {
          let labelA = a.label.toUpperCase();
          let labelB = b.label.toUpperCase();
          return labelA < labelB ? -1 : labelA > labelB ? 1 : 0;
        });

        let sortedMeasures = measures.sort((a, b) => {
          let labelA = a.label.toUpperCase();
          let labelB = b.label.toUpperCase();
          return labelA < labelB ? -1 : labelA > labelB ? 1 : 0;
        });

        let sortedCalculations = calculations.sort((a, b) => {
          let labelA = a.label.toUpperCase();
          let labelB = b.label.toUpperCase();
          return labelA < labelB ? -1 : labelA > labelB ? 1 : 0;
        });

        let sortedChildren: ModelNode[] = [];

        if (sortedMeasures.length > 0) {
          sortedChildren.push({
            id: `${node.id}.${ModelNodeIdSuffixEnum.Measures}`,
            label: ModelNodeLabelEnum.Measures,
            description: undefined,
            hidden: false,
            required: false,
            isField: false,
            children: [],
            nodeClass: FieldClassEnum.Info
          });

          sortedChildren = sortedChildren.concat(sortedMeasures);
        }

        if (sortedCalculations.length > 0) {
          sortedChildren.push({
            id: `${node.id}.${ModelNodeIdSuffixEnum.Calculations}`,
            label: ModelNodeLabelEnum.Calculations,
            description: undefined,
            hidden: false,
            required: false,
            isField: false,
            children: [],
            nodeClass: FieldClassEnum.Info
          });

          sortedChildren = sortedChildren.concat(sortedCalculations);
        }

        if (sortedDimensions.length > 0) {
          sortedChildren.push({
            id: `${node.id}.${ModelNodeIdSuffixEnum.Dimensions}`,
            label: ModelNodeLabelEnum.Dimensions,
            description: undefined,
            hidden: false,
            required: false,
            isField: false,
            children: [],
            nodeClass: FieldClassEnum.Info
          });

          sortedChildren = sortedChildren.concat(sortedDimensions);
        }

        if (sortedFilters.length > 0) {
          sortedChildren.push({
            id: `${node.id}.${ModelNodeIdSuffixEnum.Filters}`,
            label: ModelNodeLabelEnum.FilterOnlyFields,
            description: undefined,
            hidden: false,
            required: false,
            isField: false,
            children: [],
            nodeClass: FieldClassEnum.Info
          });

          sortedChildren = sortedChildren.concat(sortedFilters);
        }

        node.children = sortedChildren;
      }
    });

    let sortedNodes = nodes.sort((a, b) => {
      if (a.id === MF) {
        return -1;
      }

      if (b.id === MF) {
        return 1;
      }

      return a.label.localeCompare(b.label, undefined, {
        sensitivity: 'base'
      });
    });

    if (isDefined(malloyModelDef)) {
      // let strA = JSON.stringify(malloyModelDef);
      // let byteCountA = new TextEncoder().encode(strA).byteLength;
      // console.log(`${x.name}-byteCountA`);
      // console.log(byteCountA);
      // fse.writeFile(`${x.name}-full.json`, strA);
      // malloyModelDef.references = [];
      // let strB = JSON.stringify(malloyModelDef);
      // let byteCountB = new TextEncoder().encode(strB).byteLength;
      // console.log(`${x.name}-byteCountB`);
      // console.log(byteCountB);
      // fse.writeFile(`${x.name}-no-refs.json`, strB);
    }

    let space =
      modelType === ModelTypeEnum.Malloy
        ? (x as FileMod).space
        : modelType === ModelTypeEnum.Store
          ? (x as FileStore).space
          : undefined;

    let apiModel: Model = {
      structId: structId,
      modelId: x.name,
      type: modelType,
      source: (x as FileMod).source,
      malloyModelDef: malloyModelDef,
      connectionId: x.connectionId,
      connectionType: x.connectionType,
      filePath: x.filePath,
      space: space,
      spaceFullTitle: space
        ? (spaces.find(x => x.space === space)?.fullTitle ?? '')
        : UNCATEGORIZED_SPACE_TITLE,
      fileText: files.find(file => file.path === x.filePath).content,
      storeContent: x.fileExt === FileExtensionEnum.Store ? x : undefined,
      dateRangeIncludesRightSide:
        x.fileExt === FileExtensionEnum.Store &&
        (isUndefined((x as FileStore).date_range_includes_right_side) ||
          toBooleanFromLowercaseString(
            (x as FileStore).date_range_includes_right_side
          ) === true)
          ? true
          : false,
      accessRoles:
        modelType === ModelTypeEnum.Malloy
          ? ((x as FileMod).access_roles ?? [])
          : (x.access_roles ?? []),
      accessRolesCombined: x.accessRolesCombined ?? [],
      label:
        modelType === ModelTypeEnum.Malloy && isDefined(labelTag?.value)
          ? labelTag?.value.trim()
          : x.label,
      fields: apiFields,
      nodes: sortedNodes,
      serverTs: 1
    };

    apiModels.push(apiModel);
  });

  return apiModels;
}
