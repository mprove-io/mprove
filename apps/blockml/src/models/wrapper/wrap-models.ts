import { ModelDef as MalloyModelDef } from '@malloydata/malloy/index';
import { common } from '~blockml/barrels/common';
import { getFieldItems } from '~blockml/functions/source-to-field-items';
import { wrapField } from './wrap-field';
import { wrapFieldItem } from './wrap-field-item';

export function wrapModels(item: {
  structId: string;
  models: common.FileModel[];
  stores: common.FileStore[];
  mods: common.FileMod[];
}): common.Model[] {
  let { structId, models, stores, mods } = item;

  let apiModels: common.Model[] = [];

  [...models, ...stores, ...mods].forEach(x => {
    // console.log('x');
    // console.log(x);

    let modelType =
      x.fileExt === common.FileExtensionEnum.Model
        ? common.ModelTypeEnum.SQL
        : x.fileExt === common.FileExtensionEnum.Store
          ? common.ModelTypeEnum.Store
          : x.fileExt === common.FileExtensionEnum.Mod
            ? common.ModelTypeEnum.Malloy
            : undefined;

    let apiFields: common.ModelField[] = [];
    let nodes: common.ModelNode[] = [];

    let malloyModelDef: MalloyModelDef;

    if (modelType === common.ModelTypeEnum.Malloy) {
      {
        // model fields scope

        // console.log('x');
        // console.log(x);

        malloyModelDef = (x as common.FileMod).malloyModel._modelDef;

        let fieldItems = getFieldItems(
          (x as common.FileMod).valueWithSourceInfo
        );

        // fse.writeFileSync(
        //   `${(x as common.FileMod).source}-field-items.json`,
        //   JSON.stringify(fieldItems, null, 2),
        //   'utf-8'
        // );

        let filteredFieldItems = fieldItems.filter(
          fieldItem =>
            ['dimension', 'measure'].indexOf(fieldItem.field.kind) > -1
        );

        let topIds = filteredFieldItems.map(y => {
          return y.path.length === 0 ? common.MF : y.path.join('.');
        });

        let uniqueTopIds = [...new Set(topIds)];

        uniqueTopIds.forEach(topId => {
          let topNode: common.ModelNode = {
            id: topId,
            label:
              topId === common.MF
                ? common.ModelNodeLabelEnum.ModelFields
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

          let nodeFieldItems = filteredFieldItems.filter(y => {
            if (topId === common.MF) {
              return y.path.length === 0;
            } else {
              return y.path.join('.') === topId;
            }
          });

          nodeFieldItems.forEach(fieldItem => {
            let apiField: common.ModelField = wrapFieldItem({
              fieldItem: fieldItem,
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

    if (modelType === common.ModelTypeEnum.SQL) {
      {
        // model fields scope

        let topNode: common.ModelNode = {
          id: common.MF,
          label: common.ModelNodeLabelEnum.ModelFields,
          description: undefined,
          hidden: false,
          required: false,
          isField: false,
          children: [],
          nodeClass: common.FieldClassEnum.Join
        };

        (x as common.FileModel).fields.forEach(field => {
          let apiField = wrapField({
            isStoreModel: x.fileExt === common.FileExtensionEnum.Store,
            field: field,
            alias: common.MF,
            filePath: x.filePath,
            fileName: x.fileName,
            topNode: topNode
          });

          apiFields.push(apiField);
        });

        if ((x as common.FileModel).fields.length > 0) {
          nodes.push(topNode);
        }
      }

      (x as common.FileModel).joins.forEach(join => {
        // join fields scope
        let joinHidden = common.toBooleanFromLowercaseString(join.hidden);

        let topNode: common.ModelNode = {
          id: join.as,
          label: join.label,
          description: join.description,
          hidden: joinHidden,
          required: false,
          isField: false,
          children: [],
          nodeClass: common.FieldClassEnum.Join,
          viewFilePath: join.view.filePath,
          viewName: join.view.name
        };

        join.view.fields.forEach(field => {
          let apiField = wrapField({
            isStoreModel: x.fileExt === common.FileExtensionEnum.Store,
            field: field,
            alias: join.as,
            fileName: join.view.fileName,
            filePath: join.view.filePath,
            topNode: topNode
          });

          apiFields.push(apiField);
        });

        if (join.view.fields.length > 0) {
          nodes.push(topNode);
        }
      });
    }

    if (modelType === common.ModelTypeEnum.Store) {
      {
        // model fields scope

        let topNode: common.ModelNode = {
          id: common.MF,
          label: common.ModelNodeLabelEnum.ModelFields,
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
            let apiField = wrapField({
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
          let apiField = wrapField({
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

        // let sortedMeasuresAndCalculations = [...measures, ...calculations].sort((a, b) => {
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
          if (common.isDefined(nc.children)) {
            nc.children = nc.children.sort((a, b) => {
              let timeframeIndexA = common.TIMEFRAME_VALUES.map(t =>
                t.toString()
              ).indexOf(a.id.split(common.TRIPLE_UNDERSCORE)[1]);

              let timeframeIndexB = common.TIMEFRAME_VALUES.map(t =>
                t.toString()
              ).indexOf(b.id.split(common.TRIPLE_UNDERSCORE)[1]);

              let labelA = a.label.toUpperCase();
              let labelB = b.label.toUpperCase();
              return timeframeIndexA < timeframeIndexB
                ? -1
                : timeframeIndexA > timeframeIndexB
                  ? 1
                  : labelA < labelB
                    ? -1
                    : labelA > labelB
                      ? 1
                      : 0;
            });
          }
        });
      }
    });

    let sortedNodes = nodes.sort((a, b) => {
      let labelA = a.label.toUpperCase();
      let labelB = b.label.toUpperCase();
      return labelA < labelB ? -1 : labelA > labelB ? 1 : 0;
    });

    if (sortedNodes.length > 0) {
      let apiModel: common.Model = {
        structId: structId,
        type: modelType,
        malloyModelDef: malloyModelDef,
        modelId:
          x.fileExt === common.FileExtensionEnum.Store
            ? `${common.STORE_MODEL_PREFIX}_${x.name}`
            : x.name,
        connectionId: x.connection.connectionId,
        filePath: x.filePath,
        content: x,
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
        isViewModel:
          x.fileExt === common.FileExtensionEnum.Model
            ? (x as common.FileModel).isViewModel
            : false,
        accessRoles: x.access_roles || [],
        label:
          x.fileExt === common.FileExtensionEnum.Store
            ? `Store Model - ${x.label}`
            : x.label,
        description: (x as common.FileStore | common.FileModel).description,
        gr:
          x.fileExt === common.FileExtensionEnum.Model
            ? (x as common.FileModel).group
            : undefined,
        hidden:
          x.fileExt === common.FileExtensionEnum.Model
            ? common.toBooleanFromLowercaseString(
                (x as common.FileModel).hidden
              )
            : false,
        fields: apiFields,
        nodes: sortedNodes,
        serverTs: 1
      };

      apiModels.push(apiModel);
    }
  });

  return apiModels;
}
