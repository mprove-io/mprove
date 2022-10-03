import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = enums.FuncEnum.CheckTableEnvRefs;

export function checkTableEnvRefs(
  item: {
    views: interfaces.View[];
    errors: BmError[];
    structId: string;
    envId: string;
    evs: common.Ev[];
    caller: enums.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Input, item);

  let newViews: interfaces.View[] = [];

  item.views.forEach(x => {
    let errorsOnStart = item.errors.length;

    if (common.isUndefined(x.table)) {
      newViews.push(x);
      return;
    }

    let reg = common.MyRegex.CAPTURE_ENV_REF_G();
    let r;

    let references: string[] = [];

    while ((r = reg.exec(x.table))) {
      references.push(r[1]);
    }

    references.forEach(reference => {
      let referenceEv = item.evs.find(ev => ev.evId === reference);

      if (common.isUndefined(referenceEv)) {
        item.errors.push(
          new BmError({
            title: enums.ErTitleEnum.TABLE_REFERENCES_MISSING_ENV_VAR,
            message: `variable "${reference}" is missing for env "${item.envId}"`,
            lines: [
              {
                line: x.table_line_num,
                name: x.fileName,
                path: x.filePath
              }
            ]
          })
        );
        return;
      }
    });

    if (errorsOnStart === item.errors.length) {
      let reg2 = common.MyRegex.CAPTURE_ENV_REF();
      let r2;

      while ((r2 = reg2.exec(x.table))) {
        let reference2 = r2[1];
        let referenceEv2 = item.evs.find(ev => ev.evId === reference2);

        x.table = common.MyRegex.replaceEnvRefs(
          x.table,
          reference2,
          referenceEv2.val
        );
      }

      newViews.push(x);
    }
  });

  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Views, newViews);

  return newViews;
}
