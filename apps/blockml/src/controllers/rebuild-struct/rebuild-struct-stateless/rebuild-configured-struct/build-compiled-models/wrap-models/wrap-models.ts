import type { ModelDef as MalloyModelDef } from '@malloydata/malloy';
import type { ModelEntryValueWithSource } from '@malloydata/malloy-interfaces';
import { Result } from '@praha/byethrow';
import { parseTags } from '#blockml/functions/parse-tags/parse-tags';
import { MF, UNCATEGORIZED_SPACE_TITLE } from '#common/constants/top';
import { capitalizeFirstLetter } from '#common/functions/capitalize-first-letter/capitalize-first-letter';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import { toBooleanFromLowercaseString } from '#common/functions/to-boolean-from-lowercase-string/to-boolean-from-lowercase-string';
import type { FieldResult } from '#common/types/blockml/parts/field/field-result';
import type { BmlFile } from '#common/types/blockml/parts/file/bml-file';
import type { FileParameter } from '#common/types/blockml/parts/file/file-parameter';
import type { FileMod } from '#common/types/blockml/parts/internal/file-mod';
import type { FilePartSpace } from '#common/types/blockml/parts/internal/file-part-space';
import type { FileStore } from '#common/types/blockml/parts/internal/file-store';
import type { Model } from '#common/types/blockml/parts/model/model';
import type { ModelField } from '#common/types/blockml/parts/model/model-field';
import type { ModelNode } from '#common/types/blockml/parts/model/model-node';
import type { ModelNodeIdSuffix } from '#common/types/blockml/parts/model/model-node-id-suffix';
import type { ModelNodeLabel } from '#common/types/blockml/parts/model/model-node-label';
import type { ModelType } from '#common/types/blockml/parts/model/model-type';
import type { KeyValuePair } from '#common/types/blockml/parts/tag/key-value-pair';
import { applyTreeDoubleUnderscore } from './apply-tree-double-underscore/apply-tree-double-underscore';
import { wrapField } from './wrap-field/wrap-field';
import { wrapFlatMalloyFieldItem } from './wrap-flat-malloy-field-item/wrap-flat-malloy-field-item';

// import fse from 'fs-extra';

export function wrapModels(item: {
  projectId: string;
  structId: string;
  stores: FileStore[];
  mods: FileMod[];
  spaces: FilePartSpace[];
  files: BmlFile[];
}): Result.Result<Model[], never> {
  let { projectId, structId, stores, mods, spaces, files } = item;

  let apiModels: Model[] = [];

  [...stores, ...mods].forEach(x => {
    let modelType: ModelType =
      x.fileExt === '.store'
        ? 'Store'
        : x.fileExt === '.malloy'
          ? 'Malloy'
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

    if (modelType === 'Malloy') {
      {
        // model fields scope

        malloyModelDef = (x as FileMod).malloyModel._modelDef;
        malloySourceInfo = (x as FileMod).valueWithSourceInfo;

        let tagsResult = parseTags({
          inputs: malloySourceInfo.annotations?.map(x => x.value) || []
        });

        mproveTags = tagsResult.mproveTags;
        malloyTags = tagsResult.malloyTags;

        labelTag = mproveTags.find(
          tag => tag.key === ('label' satisfies FileParameter)
        );
        topLabelTag = mproveTags.find(
          tag => tag.key === ('top_label' satisfies FileParameter)
        );
        treeDoubleUnderscore = mproveTags.some(
          tag => tag.key === ('tree_double_underscore' satisfies FileParameter)
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
                ? modelType === 'Malloy' && isDefined(topLabelTag?.value)
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
            nodeClass: 'join'
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
              (
                ['string', 'number', 'boolean', 'ts'] satisfies FieldResult[]
              ).some(candidate => candidate === apiField.result)
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

    if (modelType === 'Store') {
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
          nodeClass: 'join'
        };

        (x as FileStore).fields
          .filter(field => field.group === MF)
          .forEach(field => {
            let apiField: ModelField = wrapField({
              isStoreModel: x.fileExt === '.store',
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
          nodeClass: 'join',
          viewFilePath: undefined, // join.view.filePath,
          viewName: undefined // join.view.name
        };

        let fieldGroupFields = (x as FileStore).fields.filter(
          f => f.group === fieldGroup.group
        );

        fieldGroupFields.forEach(field => {
          let apiField: ModelField = wrapField({
            isStoreModel: x.fileExt === '.store',
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
            case n.nodeClass === 'filter': {
              filters.push(n);
              break;
            }

            case n.nodeClass === 'dimension': {
              dimensions.push(n);
              break;
            }

            case n.nodeClass === 'measure': {
              measures.push(n);
              break;
            }

            case n.nodeClass === 'calculation': {
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
            id: `${node.id}.${'measures' satisfies ModelNodeIdSuffix}`,
            label: 'Measures' satisfies ModelNodeLabel,
            description: undefined,
            hidden: false,
            required: false,
            isField: false,
            children: [],
            nodeClass: 'info'
          });

          sortedChildren = sortedChildren.concat(sortedMeasures);
        }

        if (sortedCalculations.length > 0) {
          sortedChildren.push({
            id: `${node.id}.${'calculations' satisfies ModelNodeIdSuffix}`,
            label: 'Calculations' satisfies ModelNodeLabel,
            description: undefined,
            hidden: false,
            required: false,
            isField: false,
            children: [],
            nodeClass: 'info'
          });

          sortedChildren = sortedChildren.concat(sortedCalculations);
        }

        if (sortedDimensions.length > 0) {
          sortedChildren.push({
            id: `${node.id}.${'dimensions' satisfies ModelNodeIdSuffix}`,
            label: 'Dimensions' satisfies ModelNodeLabel,
            description: undefined,
            hidden: false,
            required: false,
            isField: false,
            children: [],
            nodeClass: 'info'
          });

          sortedChildren = sortedChildren.concat(sortedDimensions);
        }

        if (sortedFilters.length > 0) {
          sortedChildren.push({
            id: `${node.id}.${'filters' satisfies ModelNodeIdSuffix}`,
            label: 'Filter-only fields' satisfies ModelNodeLabel,
            description: undefined,
            hidden: false,
            required: false,
            isField: false,
            children: [],
            nodeClass: 'info'
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
      modelType === 'Malloy'
        ? (x as FileMod).space
        : modelType === 'Store'
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
      storeContent: x.fileExt === '.store' ? x : undefined,
      dateRangeIncludesRightSide:
        x.fileExt === '.store' &&
        (isUndefined((x as FileStore).date_range_includes_right_side) ||
          toBooleanFromLowercaseString(
            (x as FileStore).date_range_includes_right_side
          ) === true)
          ? true
          : false,
      accessRoles:
        modelType === 'Malloy'
          ? ((x as FileMod).access_roles ?? [])
          : (x.access_roles ?? []),
      accessRolesCombined: x.accessRolesCombined ?? [],
      label:
        modelType === 'Malloy' && isDefined(labelTag?.value)
          ? labelTag?.value.trim()
          : x.label,
      fields: apiFields,
      nodes: sortedNodes,
      serverTs: 1
    };

    apiModels.push(apiModel);
  });

  return Result.succeed(apiModels);
}
