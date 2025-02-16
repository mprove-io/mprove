import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';
let Graph = require('tarjan-graph');
let toposort = require('toposort');

let func = common.FuncEnum.CheckStoreShowIfCycles;

export function checkStoreShowIfCycles(
  item: {
    stores: common.FileStore[];
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Input, item);

  let newStores: common.FileStore[] = [];

  item.stores.forEach(x => {
    let errorsOnStart = item.errors.length;

    let g = new Graph();

    x.fields
      .filter(y => y.fieldClass === common.FieldClassEnum.Filter)
      .forEach(fieldFilter => {
        let parentRefName: string;

        if (common.isDefined(fieldFilter.show_if)) {
          let reg = common.MyRegex.CAPTURE_TRIPLE_REF_FOR_SHOW_IF_G();

          let r = reg.exec(fieldFilter.show_if);

          let filterName = r[1];
          let fractionControlName = r[2];
          let controlValue = r[3];

          parentRefName = `${filterName}.${fractionControlName}`;
        }

        fieldFilter.fraction_controls.forEach(control => {
          control.showIfDepsIncludingParentFilter = [];

          if (
            common.isDefined(fieldFilter.show_if) ||
            common.isDefined(control.show_if)
          ) {
            let sourceName = `${fieldFilter.name}.${control.name}`;

            if (common.isDefined(control.show_if)) {
              let regB = common.MyRegex.CAPTURE_TRIPLE_REF_FOR_SHOW_IF_G();

              let rB = regB.exec(control.show_if);

              let filterNameB = rB[1];
              let fractionControlNameB = rB[2];
              let controlValueB = rB[3];

              let refName = `${filterNameB}.${fractionControlNameB}`;

              g.add(sourceName, [refName]);
              control.showIfDepsIncludingParentFilter.push(refName);
            }

            if (common.isDefined(parentRefName)) {
              g.add(sourceName, [parentRefName]);
              control.showIfDepsIncludingParentFilter.push(parentRefName);
            }
          }
        });
      });

    if (g.hasCycle()) {
      let cycles: any[] = g.getCycles();

      cycles.forEach(cycle => {
        let cycledNames: string[] = cycle.map((c: any) => c.name);

        let lines: common.FileErrorLine[] = [];

        cycledNames.forEach(cName => {
          let cycledFilterName = cName.split('.')[0];
          let cycledControlName = cName.split('.')[1];

          let cycledFilter = x.fields
            .filter(y => y.fieldClass === common.FieldClassEnum.Filter)
            .find(filter => filter.name === cycledFilterName);

          let cycledControl = cycledFilter.fraction_controls.find(
            control => control.name === cycledControlName
          );

          lines.push({
            line:
              cycledControl.show_if_line_num || cycledFilter.show_if_line_num,
            name: x.fileName,
            path: x.filePath
          });
        });

        let cycledNamesString: string = cycledNames.join('", "');
        item.errors.push(
          new BmError({
            title: common.ErTitleEnum.SHOW_IF_CYCLE_IN_REFERENCES,
            message: `show_if "${cycledNamesString}" references each other by cycle`,
            lines: lines
          })
        );

        return;
      });
    } else {
      // not cyclic - toposort
      let graph: string[][] = [];
      let zeroDepsControls: string[] = [];

      let controlsWithShowIfDeps = toposort(graph).reverse();

      x.fields
        .filter(y => y.fieldClass === common.FieldClassEnum.Filter)
        .forEach(fieldFilter => {
          fieldFilter.fraction_controls.forEach(control => {
            let sourceName = `${fieldFilter.name}.${control.name}`;
            if (controlsWithShowIfDeps.indexOf(sourceName) < 0) {
              // if (control.showIfDeps.length === 0) {
              zeroDepsControls.push(sourceName);
            }
          });
        });

      x.filterControlsSortedByShowIfDeps = [
        ...zeroDepsControls,
        ...controlsWithShowIfDeps
      ];
    }

    if (errorsOnStart === item.errors.length) {
      newStores.push(x);
    }
  });

  helper.log(
    cs,
    caller,
    func,
    structId,
    common.LogTypeEnum.Errors,
    item.errors
  );
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Stores, newStores);

  return newStores;
}
