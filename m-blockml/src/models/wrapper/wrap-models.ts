import { api } from '../../barrels/api';
import { interfaces } from '../../barrels/interfaces';
import { constants } from '../../barrels/constants';
import { wrapField } from './wrap-field';
import { helper } from '../../barrels/helper';

export function wrapModels(item: {
  structId: string;
  models: interfaces.Model[];
}): api.Model[] {
  let { structId, models } = item;

  let apiModels: api.Model[] = [];

  models.forEach(x => {
    let apiFields: api.ModelField[] = [];
    let nodes: api.ModelNode[] = [];

    {
      // model fields scope
      let children: api.ModelNode[] = [];

      let node: api.ModelNode = {
        id: constants.MF,
        label: api.ModelNodeLabelEnum.ModelFields,
        description: undefined,
        hidden: false,
        isField: false,
        children: children,
        nodeClass: api.FieldClassEnum.Join
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
      let children: api.ModelNode[] = [];
      let joinHidden = helper.toBoolean(join.hidden);

      let node: api.ModelNode = {
        id: join.as,
        label: join.label,
        description: join.description,
        hidden: joinHidden,
        isField: false,
        children: children,
        nodeClass: api.FieldClassEnum.Join,
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
        let filters: api.ModelNode[] = [];
        let dimensions: api.ModelNode[] = [];
        let measures: api.ModelNode[] = [];
        let calculations: api.ModelNode[] = [];

        node.children.forEach(n => {
          switch (true) {
            case n.nodeClass === api.FieldClassEnum.Filter: {
              filters.push(n);
              break;
            }

            case n.nodeClass === api.FieldClassEnum.Dimension: {
              dimensions.push(n);
              break;
            }

            case n.nodeClass === api.FieldClassEnum.Measure: {
              measures.push(n);
              break;
            }

            case n.nodeClass === api.FieldClassEnum.Calculation: {
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

        let sortedChildren: api.ModelNode[] = [];

        if (sortedDimensions.length > 0) {
          sortedChildren.push({
            id: `${node.id}.${api.ModelNodeIdSuffixEnum.Dimensions}`,
            label: api.ModelNodeLabelEnum.Dimensions,
            description: undefined,
            hidden: false,
            isField: false,
            children: [],
            nodeClass: api.FieldClassEnum.Info
          });

          sortedChildren = sortedChildren.concat(sortedDimensions);
        }

        if (sortedMeasures.length > 0) {
          sortedChildren.push({
            id: `${node.id}.${api.ModelNodeIdSuffixEnum.Measures}`,
            label: api.ModelNodeLabelEnum.Measures,
            description: undefined,
            hidden: false,
            isField: false,
            children: [],
            nodeClass: api.FieldClassEnum.Info
          });

          sortedChildren = sortedChildren.concat(sortedMeasures);
        }

        if (sortedCalculations.length > 0) {
          sortedChildren.push({
            id: `${node.id}.${api.ModelNodeIdSuffixEnum.Calculations}`,
            label: api.ModelNodeLabelEnum.Calculations,
            description: undefined,
            hidden: false,
            isField: false,
            children: [],
            nodeClass: api.FieldClassEnum.Info
          });

          sortedChildren = sortedChildren.concat(sortedCalculations);
        }

        if (sortedFilters.length > 0) {
          sortedChildren.push({
            id: `${node.id}.${api.ModelNodeIdSuffixEnum.Filters}`,
            label: api.ModelNodeLabelEnum.FilterOnlyFields,
            description: undefined,
            hidden: false,
            isField: false,
            children: [],
            nodeClass: api.FieldClassEnum.Info
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
