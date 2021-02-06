import { apiToBlockml } from '~blockml/barrels/api-to-blockml';
import { constants } from '~blockml/barrels/constants';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { wrapField } from './wrap-field';

export function wrapModels(item: {
  structId: string;
  models: interfaces.Model[];
}): apiToBlockml.Model[] {
  let { structId, models } = item;

  let apiModels: apiToBlockml.Model[] = [];

  models.forEach(x => {
    let apiFields: apiToBlockml.ModelField[] = [];
    let nodes: apiToBlockml.ModelNode[] = [];

    {
      // model fields scope
      let children: apiToBlockml.ModelNode[] = [];

      let node: apiToBlockml.ModelNode = {
        id: constants.MF,
        label: apiToBlockml.ModelNodeLabelEnum.ModelFields,
        description: undefined,
        hidden: false,
        isField: false,
        children: children,
        nodeClass: apiToBlockml.FieldClassEnum.Join
      };

      x.fields.forEach(field => {
        wrapField({
          wrappedFields: apiFields,
          field: field,
          alias: constants.MF,
          fileName: x.fileName,
          children: children,
          node: node
        });
      });

      if (x.fields.length > 0) {
        nodes.push(node);
      }
    }

    x.joins.forEach(join => {
      // join fields scope
      let children: apiToBlockml.ModelNode[] = [];
      let joinHidden = helper.toBoolean(join.hidden);

      let node: apiToBlockml.ModelNode = {
        id: join.as,
        label: join.label,
        description: join.description,
        hidden: joinHidden,
        isField: false,
        children: children,
        nodeClass: apiToBlockml.FieldClassEnum.Join,
        viewName: join.view.name
      };

      join.view.fields.forEach(field => {
        wrapField({
          wrappedFields: apiFields,
          field: field,
          alias: join.as,
          fileName: join.view.fileName,
          children: children,
          node: node
        });
      });

      if (join.view.fields.length > 0) {
        nodes.push(node);
      }
    });

    nodes.forEach(node => {
      if (helper.isDefined(node.children)) {
        let filters: apiToBlockml.ModelNode[] = [];
        let dimensions: apiToBlockml.ModelNode[] = [];
        let measures: apiToBlockml.ModelNode[] = [];
        let calculations: apiToBlockml.ModelNode[] = [];

        node.children.forEach(n => {
          switch (true) {
            case n.nodeClass === apiToBlockml.FieldClassEnum.Filter: {
              filters.push(n);
              break;
            }

            case n.nodeClass === apiToBlockml.FieldClassEnum.Dimension: {
              dimensions.push(n);
              break;
            }

            case n.nodeClass === apiToBlockml.FieldClassEnum.Measure: {
              measures.push(n);
              break;
            }

            case n.nodeClass === apiToBlockml.FieldClassEnum.Calculation: {
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

        let sortedChildren: apiToBlockml.ModelNode[] = [];

        if (sortedDimensions.length > 0) {
          sortedChildren.push({
            id: `${node.id}.${apiToBlockml.ModelNodeIdSuffixEnum.Dimensions}`,
            label: apiToBlockml.ModelNodeLabelEnum.Dimensions,
            description: undefined,
            hidden: false,
            isField: false,
            children: [],
            nodeClass: apiToBlockml.FieldClassEnum.Info
          });

          sortedChildren = sortedChildren.concat(sortedDimensions);
        }

        if (sortedMeasures.length > 0) {
          sortedChildren.push({
            id: `${node.id}.${apiToBlockml.ModelNodeIdSuffixEnum.Measures}`,
            label: apiToBlockml.ModelNodeLabelEnum.Measures,
            description: undefined,
            hidden: false,
            isField: false,
            children: [],
            nodeClass: apiToBlockml.FieldClassEnum.Info
          });

          sortedChildren = sortedChildren.concat(sortedMeasures);
        }

        if (sortedCalculations.length > 0) {
          sortedChildren.push({
            id: `${node.id}.${apiToBlockml.ModelNodeIdSuffixEnum.Calculations}`,
            label: apiToBlockml.ModelNodeLabelEnum.Calculations,
            description: undefined,
            hidden: false,
            isField: false,
            children: [],
            nodeClass: apiToBlockml.FieldClassEnum.Info
          });

          sortedChildren = sortedChildren.concat(sortedCalculations);
        }

        if (sortedFilters.length > 0) {
          sortedChildren.push({
            id: `${node.id}.${apiToBlockml.ModelNodeIdSuffixEnum.Filters}`,
            label: apiToBlockml.ModelNodeLabelEnum.FilterOnlyFields,
            description: undefined,
            hidden: false,
            isField: false,
            children: [],
            nodeClass: apiToBlockml.FieldClassEnum.Info
          });

          sortedChildren = sortedChildren.concat(sortedFilters);
        }

        node.children = sortedChildren;

        node.children.forEach(nc => {
          if (helper.isDefined(nc.children)) {
            nc.children = nc.children.sort((a, b) => {
              let labelA = a.label.toUpperCase();
              let labelB = b.label.toUpperCase();
              return labelA < labelB ? -1 : labelA > labelB ? 1 : 0;
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
        modelId: x.name,
        content: x,
        accessUsers: x.access_users || [],
        accessRoles: x.access_roles || [],
        label: x.label,
        description: x.description,
        gr: x.group,
        hidden: helper.toBoolean(x.hidden),
        fields: apiFields,
        nodes: sortedNodes,
        serverTs: 1
      });
    }
  });

  return apiModels;
}
