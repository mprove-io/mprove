import {
  ModelDef as MalloyModelDef,
  SourceDef as MalloySourceDef
} from '@malloydata/malloy';
import { ModelEntryValueWithSource } from '@malloydata/malloy-interfaces';
import { common } from '~blockml/barrels/common';
import {
  FieldItem,
  getFieldItems
} from '~blockml/functions/source-to-field-items';
import { parseTags } from '~common/functions/parse-tags';
import { wrapField } from './wrap-field';
import { wrapFieldItem } from './wrap-field-item';

export interface FieldItemX extends FieldItem {
  filePath: string;
  lineNum: number;
}

export function wrapModels(item: {
  projectId: string;
  structId: string;
  stores: common.FileStore[];
  mods: common.FileMod[];
  files: common.BmlFile[];
}): common.Model[] {
  let { projectId, structId, stores, mods, files } = item;

  let apiModels: common.Model[] = [];

  [...stores, ...mods].forEach(x => {
    let modelType =
      x.fileExt === common.FileExtensionEnum.Store
        ? common.ModelTypeEnum.Store
        : x.fileExt === common.FileExtensionEnum.Malloy
          ? common.ModelTypeEnum.Malloy
          : undefined;

    let apiFields: common.ModelField[] = [];
    let nodes: common.ModelNode[] = [];

    let malloyModelDef: MalloyModelDef;
    let malloySourceInfo: ModelEntryValueWithSource;
    let mproveTags = [];
    let malloyTags = [];
    let accessRolesTag: common.KeyValuePair;

    if (modelType === common.ModelTypeEnum.Malloy) {
      {
        // model fields scope

        // console.log('x');
        // console.log(x);

        malloyModelDef = (x as common.FileMod).malloyModel._modelDef;
        malloySourceInfo = (x as common.FileMod).valueWithSourceInfo;

        let tagsResult = parseTags({
          inputs: malloySourceInfo.annotations?.map(x => x.value) || []
        });

        mproveTags = tagsResult.mproveTags;
        malloyTags = tagsResult.malloyTags;

        accessRolesTag = mproveTags.find(
          tag => tag.key === common.ParameterEnum.AccessRoles
        );

        let fieldItems = getFieldItems(malloySourceInfo);

        // fse.writeFileSync(
        //   `${(x as common.FileMod).source}-field-items.json`,
        //   JSON.stringify(fieldItems, null, 2),
        //   'utf-8'
        // );

        let fieldItemXs: FieldItemX[] = [];

        let sourceDef: MalloySourceDef = malloyModelDef.contents[
          (x as common.FileMod).source
        ] as MalloySourceDef;

        fieldItems.forEach(fieldItem => {
          // console.log('fieldItem');
          // console.log(fieldItem);

          let fields = sourceDef.fields;

          fieldItem.path.forEach(path => {
            let parent = fields.find(
              pField => pField.as === path || pField.name === path
            );

            if (common.isDefined(parent)) {
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
          return y.path.length === 0 ? common.MF : y.path.join('.');
        });

        let uniqueTopIds = [...new Set(topIds)];

        uniqueTopIds.forEach(topId => {
          let topNode: common.ModelNode = {
            id: topId,
            label:
              topId === common.MF
                ? // common.ModelNodeLabelEnum.ModelFields
                  x.label
                : topId
                    .split('.')
                    .map(k => common.capitalizeFirstLetter(k))
                    .join(' - ')
                    .split('_')
                    .map(k => common.capitalizeFirstLetter(k))
                    .join(' '),
            description: undefined,
            hidden: false,
            required: false,
            isField: false,
            children: [],
            nodeClass: common.FieldClassEnum.Join
          };

          let nodeFieldItems = filteredFieldItemXs.filter(y => {
            if (topId === common.MF) {
              return y.path.length === 0;
            } else {
              return y.path.join('.') === topId;
            }
          });

          nodeFieldItems.forEach(fieldItemX => {
            let apiField: common.ModelField = wrapFieldItem({
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

      // (x as common.FileModel).joins.forEach(join => {
      // join fields scope
      // let joinHidden = common.toBooleanFromLowercaseString(join.hidden);

      // let topNode: common.ModelNode = {
      //   id: join.as,
      //   label: join.label,
      //   description: join.description,
      //   hidden: joinHidden,
      //   required: false,
      //   isField: false,
      //   children: [],
      //   nodeClass: common.FieldClassEnum.Join,
      //   viewFilePath: join.view.filePath,
      //   viewName: join.view.name
      // };

      // join.view.fields.forEach(field => {
      //   wrapField({
      //     isStoreModel: x.fileExt === common.FileExtensionEnum.Store,
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

    if (modelType === common.ModelTypeEnum.Store) {
      {
        // model fields scope

        let topNode: common.ModelNode = {
          id: common.MF,
          label: x.label, // common.ModelNodeLabelEnum.ModelFields
          description: undefined,
          hidden: false,
          required: false,
          isField: false,
          children: [],
          nodeClass: common.FieldClassEnum.Join
        };

        (x as common.FileStore).fields
          .filter(field => field.group === common.MF)
          .forEach(field => {
            let apiField: common.ModelField = wrapField({
              isStoreModel: x.fileExt === common.FileExtensionEnum.Store,
              topNode: topNode,
              field: field,
              alias: common.MF,
              filePath: x.filePath,
              fileName: x.fileName
            });

            apiFields.push(apiField);
          });

        if ((x as common.FileStore).fields.length > 0) {
          nodes.push(topNode);
        }
      }

      (x as common.FileStore).field_groups.forEach(fieldGroup => {
        // let joinHidden = common.toBooleanFromLowercaseString(join.hidden);

        let topNode: common.ModelNode = {
          id: fieldGroup.group, // join.as,
          label: fieldGroup.label || fieldGroup.group, // join.label, TODO: field_group label
          description: undefined, //join.description, TODO: field_group description
          hidden: false, // joinHidden,
          required: false,
          isField: false,
          children: [],
          nodeClass: common.FieldClassEnum.Join,
          viewFilePath: undefined, // join.view.filePath,
          viewName: undefined // join.view.name
        };

        let fieldGroupFields = (x as common.FileStore).fields.filter(
          f => f.group === fieldGroup.group
        );

        fieldGroupFields.forEach(field => {
          let apiField: common.ModelField = wrapField({
            isStoreModel: x.fileExt === common.FileExtensionEnum.Store,
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
      if (common.isDefined(node.children)) {
        let filters: common.ModelNode[] = [];
        let dimensions: common.ModelNode[] = [];
        let measures: common.ModelNode[] = [];
        let calculations: common.ModelNode[] = [];

        node.children.forEach(n => {
          switch (true) {
            case n.nodeClass === common.FieldClassEnum.Filter: {
              filters.push(n);
              break;
            }

            case n.nodeClass === common.FieldClassEnum.Dimension: {
              dimensions.push(n);
              break;
            }

            case n.nodeClass === common.FieldClassEnum.Measure: {
              measures.push(n);
              break;
            }

            case n.nodeClass === common.FieldClassEnum.Calculation: {
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

        let sortedChildren: common.ModelNode[] = [];

        if (sortedMeasures.length > 0) {
          sortedChildren.push({
            id: `${node.id}.${common.ModelNodeIdSuffixEnum.Measures}`,
            label: common.ModelNodeLabelEnum.Measures,
            description: undefined,
            hidden: false,
            required: false,
            isField: false,
            children: [],
            nodeClass: common.FieldClassEnum.Info
          });

          sortedChildren = sortedChildren.concat(sortedMeasures);
        }

        if (sortedCalculations.length > 0) {
          sortedChildren.push({
            id: `${node.id}.${common.ModelNodeIdSuffixEnum.Calculations}`,
            label: common.ModelNodeLabelEnum.Calculations,
            description: undefined,
            hidden: false,
            required: false,
            isField: false,
            children: [],
            nodeClass: common.FieldClassEnum.Info
          });

          sortedChildren = sortedChildren.concat(sortedCalculations);
        }

        // if (sortedMeasuresAndCalculations.length > 0) {
        //   sortedChildren.push({
        //     id: `${node.id}.${common.ModelNodeIdSuffixEnum.MeasuresAndCalculations}`,
        //     label: common.ModelNodeLabelEnum.MeasuresAndCalculations,
        //     description: undefined,
        //     hidden: false,
        //     required: false,
        //     isField: false,
        //     children: [],
        //     nodeClass: common.FieldClassEnum.Info
        //   });

        //   sortedChildren = sortedChildren.concat(sortedMeasuresAndCalculations);
        // }

        if (sortedDimensions.length > 0) {
          sortedChildren.push({
            id: `${node.id}.${common.ModelNodeIdSuffixEnum.Dimensions}`,
            label: common.ModelNodeLabelEnum.Dimensions,
            description: undefined,
            hidden: false,
            required: false,
            isField: false,
            children: [],
            nodeClass: common.FieldClassEnum.Info
          });

          sortedChildren = sortedChildren.concat(sortedDimensions);
        }

        if (sortedFilters.length > 0) {
          sortedChildren.push({
            id: `${node.id}.${common.ModelNodeIdSuffixEnum.Filters}`,
            label: common.ModelNodeLabelEnum.FilterOnlyFields,
            description: undefined,
            hidden: false,
            required: false,
            isField: false,
            children: [],
            nodeClass: common.FieldClassEnum.Info
          });

          sortedChildren = sortedChildren.concat(sortedFilters);
        }

        node.children = sortedChildren;

        node.children.forEach(nc => {
          // if (common.isDefined(nc.children)) {
          //   nc.children = nc.children.sort((a, b) => {
          //     let timeframeIndexA = common.TIMEFRAME_VALUES.map(t =>
          //       t.toString()
          //     ).indexOf(a.id.split(common.TRIPLE_UNDERSCORE)[1]);
          //     let timeframeIndexB = common.TIMEFRAME_VALUES.map(t =>
          //       t.toString()
          //     ).indexOf(b.id.split(common.TRIPLE_UNDERSCORE)[1]);
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
    if (common.isDefined(malloyModelDef)) {
      malloyModelDef.references = []; // TODO: clarify
    }

    let apiModel: common.Model = {
      structId: structId,
      modelId: x.name,
      type: modelType,
      source: (x as common.FileMod).source,
      malloyModelDef: malloyModelDef,
      connectionId: x.connection.connectionId,
      filePath: x.filePath,
      fileText: files.find(file => file.path === x.filePath).content,
      content: x.fileExt === common.FileExtensionEnum.Store ? x : undefined,
      // isStoreModel: x.fileExt === common.FileExtensionEnum.Store,
      dateRangeIncludesRightSide:
        x.fileExt === common.FileExtensionEnum.Store &&
        (common.isUndefined(
          (x as common.FileStore).date_range_includes_right_side
        ) ||
          common.toBooleanFromLowercaseString(
            (x as common.FileStore).date_range_includes_right_side
          ) === true)
          ? true
          : false,
      isViewModel: false,
      accessRoles:
        modelType === common.ModelTypeEnum.Malloy &&
        common.isDefined(accessRolesTag?.value)
          ? accessRolesTag.value.split(',').map(x => x.trim())
          : (x.access_roles ?? []),
      label:
        x.fileExt === common.FileExtensionEnum.Store
          ? `Store Model - ${x.label}`
          : x.label,
      description: (x as common.FileStore).description,
      gr: undefined,
      hidden: false,
      fields: apiFields,
      nodes: sortedNodes,
      serverTs: 1
    };

    // if (modelType === common.ModelTypeEnum.Malloy) {
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
