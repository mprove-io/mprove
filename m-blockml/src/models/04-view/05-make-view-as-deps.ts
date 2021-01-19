import { helper } from '../../barrels/helper';
import { enums } from '../../barrels/enums';
import { api } from '../../barrels/api';
import { BmError } from '../bm-error';
import { interfaces } from '../../barrels/interfaces';
import { ConfigService } from '@nestjs/config';

let func = enums.FuncEnum.MakeViewAsDeps;

export function makeViewAsDeps(item: {
  views: interfaces.View[];
  errors: BmError[];
  structId: string;
  caller: enums.CallerEnum;
  cs: ConfigService;
}) {
  let { caller, structId, cs } = item;
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Input, item);

  let newViews: interfaces.View[] = [];

  item.views.forEach(x => {
    let errorsOnStart = item.errors.length;

    // init
    x.asDeps = {};

    if (helper.isDefined(x.derived_table)) {
      let input = x.derived_table;

      // checking AS
      let reg = api.MyRegex.CAPTURE_VIEW_REF_G();
      let r;

      while ((r = reg.exec(input))) {
        let view: string = r[1];
        let alias: string = r[2];

        if (view === x.name) {
          item.errors.push(
            new BmError({
              title: enums.ErTitleEnum.DERIVED_TABLE_VIEW_SELF_REFERENCE,
              message: `${enums.ParameterEnum.DerivedTable} contains reference to "${view}"`,
              lines: [
                {
                  line: x.derived_table_line_num,
                  name: x.fileName,
                  path: x.filePath
                }
              ]
            })
          );
          return;
        }

        if (helper.isUndefined(x.asDeps[alias])) {
          x.asDeps[alias] = { viewName: view, fieldNames: {} };
        } else if (x.asDeps[alias].viewName !== view) {
          item.errors.push(
            new BmError({
              title:
                enums.ErTitleEnum.DERIVED_TABLE_SAME_ALIAS_FOR_DIFFERENT_VIEWS,
              message:
                `${enums.ParameterEnum.DerivedTable} references different views ` +
                `using same alias "${alias}"`,
              lines: [
                {
                  line: x.derived_table_line_num,
                  name: x.fileName,
                  path: x.filePath
                }
              ]
            })
          );
          return;
        }
      }

      // checking doubles
      let reg2 = api.MyRegex.CAPTURE_DOUBLE_REF_G();
      let r2;

      while ((r2 = reg2.exec(input))) {
        let as: string = r2[1];
        let dep: string = r2[2];

        if (helper.isUndefined(x.asDeps[as])) {
          item.errors.push(
            new BmError({
              title: enums.ErTitleEnum.DERIVED_TABLE_NO_VIEW_REFERENCE,
              message:
                `${enums.ParameterEnum.DerivedTable} references field $\{${as}.${dep}\} but ` +
                `no View reference found for alias "${as}"`,
              lines: [
                {
                  line: x.derived_table_line_num,
                  name: x.fileName,
                  path: x.filePath
                }
              ]
            })
          );
          return;
        } else {
          x.asDeps[as].fieldNames[dep] = 1;
        }
      }
    }

    if (errorsOnStart === item.errors.length) {
      newViews.push(x);
    }

    let viewDeps: string[] = [];

    Object.keys(x.asDeps).forEach(as => {
      viewDeps.push(x.asDeps[as].viewName);
    });

    x.viewDeps = viewDeps;
  });

  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Views, newViews);

  return newViews;
}
