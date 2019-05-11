import { ApRegex } from '../../barrels/am-regex';
import { interfaces } from '../../barrels/interfaces';

export function pickUdfsAndMakePdtViewDeps(item: { views: interfaces.View[] }) {
  item.views.forEach(x => {
    let permanentDeps: { [view: string]: number } = {};
    let permanentDepsAll: { [view: string]: number } = {};

    if (Object.keys(x.as_deps).length > 0) {
      let currentViewPlusNotPermanentDeps: { [view: string]: number } = {};

      currentViewPlusNotPermanentDeps[x.name] = 1;

      let run: boolean = true;

      while (run) {
        let startLength = Object.keys(currentViewPlusNotPermanentDeps).length;

        Object.keys(currentViewPlusNotPermanentDeps).forEach(name => {
          let view = item.views.find(v => v.name === name);

          Object.keys(view.as_deps).forEach(as => {
            let referencedViewName = view.as_deps[as].view_name;

            let referencedView = item.views.find(
              v => v.name === referencedViewName
            );

            if (
              typeof referencedView.derived_table !== 'undefined' &&
              referencedView.derived_table !== null &&
              referencedView.permanent.match(ApRegex.TRUE())
            ) {
              permanentDeps[referencedViewName] = 1;
            } else {
              currentViewPlusNotPermanentDeps[referencedViewName] = 1;
            }
          });
        });

        let endLength = Object.keys(currentViewPlusNotPermanentDeps).length;

        if (startLength === endLength) {
          run = false;
        }
      }

      // allUdfs - udfs from current View plus not permanent Dependent views

      let allUdfs: { [udf: string]: number } = {};

      Object.keys(currentViewPlusNotPermanentDeps).forEach(name => {
        let view = item.views.find(v => v.name === name);

        if (view.udfs && view.udfs.length > 0) {
          view.udfs.forEach(udfName => {
            allUdfs[udfName] = 1;
          });
        }
      });

      x.udfs = Object.keys(allUdfs);

      // pdt view deps all

      permanentDepsAll = Object.assign({}, permanentDeps);

      let depsAll = Object.assign({}, permanentDepsAll);

      let start: boolean = true;

      while (start) {
        let startLength = Object.keys(depsAll).length;

        Object.keys(depsAll).forEach(name => {
          let view = item.views.find(v => v.name === name);

          Object.keys(view.as_deps).forEach(as => {
            let referencedViewName = view.as_deps[as].view_name;

            let referencedView = item.views.find(
              v => v.name === referencedViewName
            );

            if (
              typeof referencedView.derived_table !== 'undefined' &&
              referencedView.derived_table !== null &&
              referencedView.permanent.match(ApRegex.TRUE())
            ) {
              permanentDepsAll[referencedViewName] = 1;
            }

            depsAll[referencedViewName] = 1;
          });
        });

        let endLength = Object.keys(depsAll).length;

        if (startLength === endLength) {
          start = false;
        }
      }
    }

    x.pdt_view_deps = permanentDeps;
    x.pdt_view_deps_all = permanentDepsAll;

    let viewDeps: string[] = [];

    Object.keys(x.as_deps).forEach(as => {
      viewDeps.push(x.as_deps[as].view_name);
    });

    x.view_deps = viewDeps;

    if (
      typeof x.derived_table !== 'undefined' &&
      x.derived_table !== null &&
      x.permanent.match(ApRegex.TRUE())
    ) {
      x.is_pdt = true;
    } else {
      x.is_pdt = false;
    }
  });

  return item.views;
}
