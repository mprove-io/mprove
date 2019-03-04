import { ApRegex } from '../../barrels/am-regex';
import { api } from '../../barrels/api';
import { interfaces } from '../../barrels/interfaces';

export function wrapModels(item: {
  projectId: string,
  repoId: string,
  structId: string,
  models: interfaces.Model[]
}): api.Model[] {

  let wrappedModels: api.Model[] = [];

  item.models.forEach(x => {

    let wrappedFields: api.ModelField[] = [];
    let nodes: api.ModelNode[] = [];

    {
      // model fields scope

      let children: api.ModelNode[] = [];

      let node: api.ModelNode = {
        id: 'mf',
        label: 'Model Fields',
        description: undefined,
        hidden: false,
        is_field: false,
        children: children,
        node_class: api.ModelNodeNodeClassEnum.Join,
      };

      x.fields.forEach(field => {

        this.wrapField({
          wrappedFields: wrappedFields,
          field: field,
          alias: 'mf',
          fileName: x.file,
          children: children,
          node: node,
        });
      });

      if (x.fields.length > 0) {
        nodes.push(node);
      }
    }

    x.joins.forEach(join => {

      // join fields scope

      let children: api.ModelNode[] = [];

      let joinHidden = join.hidden && join.hidden.match(ApRegex.TRUE()) ? true : false;

      let node: api.ModelNode = {
        id: join.as,
        label: join.label,
        description: join.description,
        hidden: joinHidden,
        is_field: false,
        children: children,
        node_class: api.ModelNodeNodeClassEnum.Join,
        view_name: join.view.name,
      };

      join.view.fields.forEach(field => {

        this.wrapField({
          wrappedFields: wrappedFields,
          field: field,
          alias: join.as,
          fileName: join.view.file,
          children: children,
          node: node,
        });
      });

      if (join.view.fields.length > 0) {
        nodes.push(node);
      }

    });

    nodes.forEach(node => {
      if (typeof node.children !== 'undefined' && node.children !== null) {
        let filters: api.ModelNode[] = [];
        let dimensions: api.ModelNode[] = [];
        let measures: api.ModelNode[] = [];
        let calculations: api.ModelNode[] = [];

        node.children.forEach(n => {
          switch (true) {

            case n.node_class === api.ModelNodeNodeClassEnum.Filter: {
              filters.push(n);
              break;
            }

            case n.node_class === api.ModelNodeNodeClassEnum.Dimension: {
              dimensions.push(n);
              break;

            }

            case n.node_class === api.ModelNodeNodeClassEnum.Measure: {
              measures.push(n);
              break;

            }

            case n.node_class === api.ModelNodeNodeClassEnum.Calculation: {
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

        let sortedChildren: any = [];

        if (sortedDimensions.length > 0) {
          sortedChildren.push({
            id: `${node.id}.dimensions`,
            label: 'Dimensions',
            description: undefined,
            hidden: false,
            is_field: false,
            children: [],
            node_class: api.ModelNodeNodeClassEnum.Info,
          });

          sortedChildren = sortedChildren.concat(sortedDimensions);
        }

        if (sortedMeasures.length > 0) {
          sortedChildren.push({
            id: `${node.id}.measures`,
            label: 'Measures',
            description: undefined,
            hidden: false,
            is_field: false,
            children: [],
            node_class: api.ModelNodeNodeClassEnum.Info,
          });

          sortedChildren = sortedChildren.concat(sortedMeasures);
        }

        if (sortedCalculations.length > 0) {
          sortedChildren.push({
            id: `${node.id}.calculations`,
            label: 'Calculations',
            description: undefined,
            hidden: false,
            is_field: false,
            children: [],
            node_class: api.ModelNodeNodeClassEnum.Info,
          });

          sortedChildren = sortedChildren.concat(sortedCalculations);
        }

        if (sortedFilters.length > 0) {
          sortedChildren.push({
            id: `${node.id}.filters`,
            label: 'Filter-only fields',
            description: undefined,
            hidden: false,
            is_field: false,
            children: [],
            node_class: api.ModelNodeNodeClassEnum.Info,
          });

          sortedChildren = sortedChildren.concat(sortedFilters);
        }

        node.children = sortedChildren;

        node.children.forEach(nc => {

          if (typeof nc.children !== 'undefined' && nc.children !== null) {

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

    wrappedModels.push({
      project_id: item.projectId,
      repo_id: item.repoId,
      struct_id: item.structId,
      model_id: x.name,
      content: JSON.stringify(x),
      access_users: x.access_users ? x.access_users : [],
      label: x.label,
      gr: x.group ? x.group : undefined,
      hidden: x.hidden && x.hidden.match(ApRegex.TRUE()) ? true : false,
      fields: wrappedFields,
      nodes: sortedNodes,
      server_ts: 1,
      // not required
      description: x.description,
    });
  });

  return wrappedModels;
}
