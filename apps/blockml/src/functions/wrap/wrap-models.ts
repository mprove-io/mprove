import {
  ModelDef as MalloyModelDef,
  SourceDef as MalloySourceDef
} from '@malloydata/malloy';
import { ModelEntryValueWithSource } from '@malloydata/malloy-interfaces';
import {
  FieldItem,
  getFieldItems
} from '~blockml/functions/source-to-field-items';
import { MF } from '~common/constants/top';
import { ParameterEnum } from '~common/enums/docs/parameter.enum';
import { FieldClassEnum } from '~common/enums/field-class.enum';
import { FileExtensionEnum } from '~common/enums/file-extension.enum';
import { ModelNodeIdSuffixEnum } from '~common/enums/model-node-id-suffix.enum';
import { ModelNodeLabelEnum } from '~common/enums/model-node-label.enum';
import { ModelTypeEnum } from '~common/enums/model-type.enum';
import { capitalizeFirstLetter } from '~common/functions/capitalize-first-letter';
import { isDefined } from '~common/functions/is-defined';
import { isUndefined } from '~common/functions/is-undefined';
import { parseTags } from '~common/functions/parse-tags';
import { toBooleanFromLowercaseString } from '~common/functions/to-boolean-from-lowercase-string';
import { BmlFile } from '~common/interfaces/blockml/bml-file';
import { FileMod } from '~common/interfaces/blockml/internal/file-mod';
import { FileStore } from '~common/interfaces/blockml/internal/file-store';
import { KeyValuePair } from '~common/interfaces/blockml/key-value-pair';
import { Model } from '~common/interfaces/blockml/model';
import { ModelField } from '~common/interfaces/blockml/model-field';
import { ModelNode } from '~common/interfaces/blockml/model-node';
import { wrapField } from './wrap-field';
import { wrapFieldItem } from './wrap-field-item';

export interface FieldItemX extends FieldItem {
  filePath: string;
  lineNum: number;
}

export function wrapModels(item: {
  projectId: string;
  structId: string;
  stores: FileStore[];
  mods: FileMod[];
  files: BmlFile[];
}): Model[] {
  let { projectId, structId, stores, mods, files } = item;

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
    let accessRolesTag: KeyValuePair;

    if (modelType === ModelTypeEnum.Malloy) {
      {
        // model fields scope

        // console.log('x');
        // console.log(x);

        malloyModelDef = (x as FileMod).malloyModel._modelDef;
        malloySourceInfo = (x as FileMod).valueWithSourceInfo;

        let tagsResult = parseTags({
          inputs: malloySourceInfo.annotations?.map(x => x.value) || []
        });

        mproveTags = tagsResult.mproveTags;
        malloyTags = tagsResult.malloyTags;

        accessRolesTag = mproveTags.find(
          tag => tag.key === ParameterEnum.AccessRoles
        );

        let fieldItems = getFieldItems(malloySourceInfo);

        // fse.writeFileSync(
        //   `${(x as FileMod).source}-field-items.json`,
        //   JSON.stringify(fieldItems, null, 2),
        //   'utf-8'
        // );

        let fieldItemXs: FieldItemX[] = [];

        let sourceDef: MalloySourceDef = malloyModelDef.contents[
          (x as FileMod).source
        ] as MalloySourceDef;

        fieldItems.forEach(fieldItem => {
          // console.log('fieldItem');
          // console.log(fieldItem);

          let fields = sourceDef.fields;

          fieldItem.path.forEach(path => {
            let parent = fields.find(
              pField => pField.as === path || pField.name === path
            );

            if (isDefined(parent)) {
              fields = (parent as any).fields;
            }
          });

          let field = fields.find(
            pField =>
              pField.as === fieldItem.field.name ||
              pField.name === fieldItem.field.name
          );

          let filePathStartIndex = field.location.url.indexOf(`${projectId}/`);

          let fieldItemX = Object.assign({}, fieldItem, <FieldItemX>{
            filePath: field.location.url.slice(filePathStartIndex),
            lineNum: field.location.range.start.line + 1
          });

          fieldItemXs.push(fieldItemX);
        });

        let filteredFieldItemXs = fieldItemXs.filter(
          fieldItemX =>
            ['dimension', 'measure'].indexOf(fieldItemX.field.kind) > -1
        );

        let topIds = filteredFieldItemXs.map(y => {
          return y.path.length === 0 ? MF : y.path.join('.');
        });

        let uniqueTopIds = [...new Set(topIds)];

        uniqueTopIds.forEach(topId => {
          let topNode: ModelNode = {
            id: topId,
            label:
              topId === MF
                ? // ModelNodeLabelEnum.ModelFields
                  x.label
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

          let nodeFieldItems = filteredFieldItemXs.filter(y => {
            if (topId === MF) {
              return y.path.length === 0;
            } else {
              return y.path.join('.') === topId;
            }
          });

          nodeFieldItems.forEach(fieldItemX => {
            let apiField: ModelField = wrapFieldItem({
              fieldItem: fieldItemX,
              alias: topId,
              filePath: x.filePath,
              fileName: x.fileName,
              topNode: topNode
            });

            apiFields.push(apiField);
          });

          if (nodeFieldItems.length > 0) {
            nodes.push(topNode);
          }
        });
      }

      // (x as FileModel).joins.forEach(join => {
      // join fields scope
      // let joinHidden = toBooleanFromLowercaseString(join.hidden);

      // let topNode: ModelNode = {
      //   id: join.as,
      //   label: join.label,
      //   description: join.description,
      //   hidden: joinHidden,
      //   required: false,
      //   isField: false,
      //   children: [],
      //   nodeClass: FieldClassEnum.Join,
      //   viewFilePath: join.view.filePath,
      //   viewName: join.view.name
      // };

      // join.view.fields.forEach(field => {
      //   wrapField({
      //     isStoreModel: x.fileExt === FileExtensionEnum.Store,
      //     wrappedFields: apiFields,
      //     field: field,
      //     alias: join.as,
      //     fileName: join.view.fileName,
      //     filePath: join.view.filePath,
      //     topNode: topNode
      //   });
      // });

      // if (join.view.fields.length > 0) {
      //   nodes.push(topNode);
      // }
      // });
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
        // let joinHidden = toBooleanFromLowercaseString(join.hidden);

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

        let sortedFilters = filters;
        // .sort((a, b) => {
        //   let labelA = a.label.toUpperCase();
        //   let labelB = b.label.toUpperCase();
        //   return labelA < labelB ? -1 : labelA > labelB ? 1 : 0;
        // });

        let sortedDimensions = dimensions;
        // .sort((a, b) => {
        //   let labelA = a.label.toUpperCase();
        //   let labelB = b.label.toUpperCase();
        //   return labelA < labelB ? -1 : labelA > labelB ? 1 : 0;
        // });

        let sortedMeasures = measures;
        // .sort((a, b) => {
        //   let labelA = a.label.toUpperCase();
        //   let labelB = b.label.toUpperCase();
        //   return labelA < labelB ? -1 : labelA > labelB ? 1 : 0;
        // });

        let sortedCalculations = calculations;
        // .sort((a, b) => {
        //   let labelA = a.label.toUpperCase();
        //   let labelB = b.label.toUpperCase();
        //   return labelA < labelB ? -1 : labelA > labelB ? 1 : 0;
        // });

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

        // if (sortedMeasuresAndCalculations.length > 0) {
        //   sortedChildren.push({
        //     id: `${node.id}.${ModelNodeIdSuffixEnum.MeasuresAndCalculations}`,
        //     label: ModelNodeLabelEnum.MeasuresAndCalculations,
        //     description: undefined,
        //     hidden: false,
        //     required: false,
        //     isField: false,
        //     children: [],
        //     nodeClass: FieldClassEnum.Info
        //   });

        //   sortedChildren = sortedChildren.concat(sortedMeasuresAndCalculations);
        // }

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

        node.children.forEach(nc => {
          // if (isDefined(nc.children)) {
          //   nc.children = nc.children.sort((a, b) => {
          //     let timeframeIndexA = TIMEFRAME_VALUES.map(t =>
          //       t.toString()
          //     ).indexOf(a.id.split(TRIPLE_UNDERSCORE)[1]);
          //     let timeframeIndexB = TIMEFRAME_VALUES.map(t =>
          //       t.toString()
          //     ).indexOf(b.id.split(TRIPLE_UNDERSCORE)[1]);
          //     let labelA = a.label.toUpperCase();
          //     let labelB = b.label.toUpperCase();
          //     return timeframeIndexA < timeframeIndexB
          //       ? -1
          //       : timeframeIndexA > timeframeIndexB
          //         ? 1
          //         : labelA < labelB
          //           ? -1
          //           : labelA > labelB
          //             ? 1
          //             : 0;
          //   });
          // }
        });
      }
    });

    let sortedNodes = nodes;
    // .sort((a, b) => {
    //   let labelA = a.label.toUpperCase();
    //   let labelB = b.label.toUpperCase();
    //   return labelA < labelB ? -1 : labelA > labelB ? 1 : 0;
    // });

    // if (sortedNodes.length > 0) {
    if (isDefined(malloyModelDef)) {
      malloyModelDef.references = []; // TODO: clarify
    }

    let apiModel: Model = {
      structId: structId,
      modelId: x.name,
      type: modelType,
      source: (x as FileMod).source,
      malloyModelDef: malloyModelDef,
      connectionId: x.connection.connectionId,
      filePath: x.filePath,
      fileText: files.find(file => file.path === x.filePath).content,
      content: x.fileExt === FileExtensionEnum.Store ? x : undefined,
      // isStoreModel: x.fileExt === FileExtensionEnum.Store,
      dateRangeIncludesRightSide:
        x.fileExt === FileExtensionEnum.Store &&
        (isUndefined((x as FileStore).date_range_includes_right_side) ||
          toBooleanFromLowercaseString(
            (x as FileStore).date_range_includes_right_side
          ) === true)
          ? true
          : false,
      isViewModel: false,
      accessRoles:
        modelType === ModelTypeEnum.Malloy && isDefined(accessRolesTag?.value)
          ? accessRolesTag.value.split(',').map(x => x.trim())
          : (x.access_roles ?? []),
      label:
        x.fileExt === FileExtensionEnum.Store
          ? `Store Model - ${x.label}`
          : x.label,
      description: (x as FileStore).description,
      gr: undefined,
      hidden: false,
      fields: apiFields,
      nodes: sortedNodes,
      serverTs: 1
    };

    // if (modelType === ModelTypeEnum.Malloy) {
    //   console.log('sortedNodes');
    //   console.dir(sortedNodes, { depth: null });
    // }

    apiModels.push(apiModel);
    // }
  });

  // console.log('apiModels.map(x=>x.accessRoles)');
  // console.log(apiModels.map(x => x.accessRoles));

  return apiModels;
}
