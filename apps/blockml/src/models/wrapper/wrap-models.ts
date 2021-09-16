import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { wrapField } from './wrap-field';

let timeframesOrder = [
  enums.TimeframeEnum.Year,
  enums.TimeframeEnum.Quarter,
  enums.TimeframeEnum.QuarterOfYear,
  enums.TimeframeEnum.Month,
  enums.TimeframeEnum.MonthName,
  enums.TimeframeEnum.MonthNum,
  enums.TimeframeEnum.Week,
  enums.TimeframeEnum.WeekOfYear,
  enums.TimeframeEnum.Date,
  enums.TimeframeEnum.DayOfWeek,
  enums.TimeframeEnum.DayOfWeekIndex,
  enums.TimeframeEnum.DayOfMonth,
  enums.TimeframeEnum.DayOfYear,
  enums.TimeframeEnum.Hour,
  enums.TimeframeEnum.Hour2,
  enums.TimeframeEnum.Hour3,
  enums.TimeframeEnum.Hour4,
  enums.TimeframeEnum.Hour6,
  enums.TimeframeEnum.Hour8,
  enums.TimeframeEnum.Hour12,
  enums.TimeframeEnum.HourOfDay,
  enums.TimeframeEnum.Minute,
  enums.TimeframeEnum.Minute2,
  enums.TimeframeEnum.Minute3,
  enums.TimeframeEnum.Minute5,
  enums.TimeframeEnum.Minute10,
  enums.TimeframeEnum.Minute15,
  enums.TimeframeEnum.Minute30,
  enums.TimeframeEnum.Time,
  enums.TimeframeEnum.TimeOfDay,
  enums.TimeframeEnum.YesNoHasValue
];

export function wrapModels(item: {
  structId: string;
  models: interfaces.Model[];
}): common.Model[] {
  let { structId, models } = item;

  let apiModels: common.Model[] = [];

  models.forEach(x => {
    let apiFields: common.ModelField[] = [];
    let nodes: common.ModelNode[] = [];

    {
      // model fields scope
      let children: common.ModelNode[] = [];

      let node: common.ModelNode = {
        id: constants.MF,
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
          alias: constants.MF,
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

    x.joins.forEach(join => {
      // join fields scope
      let children: common.ModelNode[] = [];
      let joinHidden = helper.toBooleanFromLowercaseString(join.hidden);

      let node: common.ModelNode = {
        id: join.as,
        label: join.label,
        description: join.description,
        hidden: joinHidden,
        isField: false,
        children: children,
        nodeClass: common.FieldClassEnum.Join,
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

        node.children = sortedChildren;

        node.children.forEach(nc => {
          if (common.isDefined(nc.children)) {
            nc.children = nc.children.sort((a, b) => {
              let timeframeIndexA = timeframesOrder
                .map(t => t.toString())
                .indexOf(a.id.split(common.TRIPLE_UNDERSCORE)[1]);

              let timeframeIndexB = timeframesOrder
                .map(t => t.toString())
                .indexOf(b.id.split(common.TRIPLE_UNDERSCORE)[1]);

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
        modelId: x.name,
        filePath: x.filePath,
        content: x,
        accessUsers: x.access_users || [],
        accessRoles: x.access_roles || [],
        label: x.label,
        description: x.description,
        gr: x.group,
        hidden: helper.toBooleanFromLowercaseString(x.hidden),
        fields: apiFields,
        nodes: sortedNodes,
        serverTs: 1
      });
    }
  });

  return apiModels;
}
