import { common } from '~blockml/barrels/common';
import { wrapField } from './wrap-field';

export function wrapModels(item: {
  structId: string;
  models: common.FileModel[];
  stores: common.FileStore[];
}): common.Model[] {
  let { structId, models, stores } = item;

  let apiModels: common.Model[] = [];

  [...models, ...stores].forEach(x => {
    let apiFields: common.ModelField[] = [];
    let nodes: common.ModelNode[] = [];
    if (x.fileExt === common.FileExtensionEnum.Model) {
      {
        // model fields scope
        let children: common.ModelNode[] = [];

        let node: common.ModelNode = {
          id: common.MF,
          label: common.ModelNodeLabelEnum.ModelFields,
          description: undefined,
          hidden: false,
          isField: false,
          children: children,
          nodeClass: common.FieldClassEnum.Join
        };

        x.fields.forEach(field => {
          wrapField({
            wrappedFields: apiFields,
            field: field,
            alias: common.MF,
            filePath: x.filePath,
            fileName: x.fileName,
            children: children,
            node: node
          });
        });

        if (x.fields.length > 0) {
          nodes.push(node);
        }
      }

      (x as common.FileModel).joins.forEach(join => {
        // join fields scope
        let children: common.ModelNode[] = [];
        let joinHidden = common.toBooleanFromLowercaseString(join.hidden);

        let node: common.ModelNode = {
          id: join.as,
          label: join.label,
          description: join.description,
          hidden: joinHidden,
          isField: false,
          children: children,
          nodeClass: common.FieldClassEnum.Join,
          viewFilePath: join.view.filePath,
          viewName: join.view.name
        };

        join.view.fields.forEach(field => {
          wrapField({
            wrappedFields: apiFields,
            field: field,
            alias: join.as,
            fileName: join.view.fileName,
            filePath: join.view.filePath,
            children: children,
            node: node
          });
        });

        if (join.view.fields.length > 0) {
          nodes.push(node);
        }
      });
    }

    if (x.fileExt === common.FileExtensionEnum.Store) {
      {
        // model fields scope
        let children: common.ModelNode[] = [];

        let node: common.ModelNode = {
          id: common.MF,
          label: common.ModelNodeLabelEnum.ModelFields,
          description: undefined,
          hidden: false,
          isField: false,
          children: children,
          nodeClass: common.FieldClassEnum.Join
        };

        x.fields
          .filter(field => field.group === common.MF)
          .forEach(field => {
            wrapField({
              children: children,
              node: node,
              wrappedFields: apiFields,
              field: field,
              alias: common.MF,
              filePath: x.filePath,
              fileName: x.fileName
            });
          });

        if (x.fields.length > 0) {
          nodes.push(node);
        }
      }

      (x as common.FileStore).field_groups.forEach(fieldGroup => {
        let children: common.ModelNode[] = [];
        // let joinHidden = common.toBooleanFromLowercaseString(join.hidden);

        let node: common.ModelNode = {
          id: fieldGroup.group, // join.as,
          label: fieldGroup.label || fieldGroup.group, // join.label, TODO: field_group label
          description: undefined, //join.description, TODO: field_group description
          hidden: false, // joinHidden,
          isField: false,
          children: children,
          nodeClass: common.FieldClassEnum.Join,
          viewFilePath: undefined, // join.view.filePath,
          viewName: undefined // join.view.name
        };

        let fieldGroupFields = x.fields.filter(
          f => f.group === fieldGroup.group
        );

        fieldGroupFields.forEach(field => {
          wrapField({
            wrappedFields: apiFields,
            field: field,
            alias: fieldGroup.group,
            filePath: x.filePath,
            fileName: x.fileName,
            children: children,
            node: node
          });
        });

        if (fieldGroupFields.length > 0) {
          nodes.push(node);
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

        let sortedChildren: common.ModelNode[] = [];

        if (sortedDimensions.length > 0) {
          sortedChildren.push({
            id: `${node.id}.${common.ModelNodeIdSuffixEnum.Dimensions}`,
            label: common.ModelNodeLabelEnum.Dimensions,
            description: undefined,
            hidden: false,
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
            isField: false,
            children: [],
            nodeClass: common.FieldClassEnum.Info
          });

          sortedChildren = sortedChildren.concat(sortedFilters);
        }

        if (sortedMeasures.length > 0) {
          sortedChildren.push({
            id: `${node.id}.${common.ModelNodeIdSuffixEnum.Measures}`,
            label: common.ModelNodeLabelEnum.Measures,
            description: undefined,
            hidden: false,
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
            isField: false,
            children: [],
            nodeClass: common.FieldClassEnum.Info
          });

          sortedChildren = sortedChildren.concat(sortedCalculations);
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
      apiModels.push({
        structId: structId,
        modelId:
          x.fileExt === common.FileExtensionEnum.Store
            ? `${common.STORE_MODEL_PREFIX}_${x.name}`
            : x.name,
        connectionId: x.connection.connectionId,
        filePath: x.filePath,
        content: x,
        isStoreModel: x.fileExt === common.FileExtensionEnum.Store,
        isViewModel:
          x.fileExt === common.FileExtensionEnum.Model
            ? (x as common.FileModel).isViewModel
            : false,
        accessUsers: x.access_users || [],
        accessRoles: x.access_roles || [],
        label:
          x.fileExt === common.FileExtensionEnum.Store
            ? `Store Model - ${x.label}`
            : x.label,
        description: x.description,
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
      });
    }
  });

  return apiModels;
}
