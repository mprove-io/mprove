import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';
let func = common.FuncEnum.CheckStoreShowIfSelfReference;

export function checkStoreShowIfSelfReference(
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

    x.fields
      .filter(y => y.fieldClass === common.FieldClassEnum.Filter)
      .forEach(fieldFilter => {
        if (common.isDefined(fieldFilter.show_if)) {
          let reg = common.MyRegex.CAPTURE_TRIPLE_REF_FOR_SHOW_IF_G();

          let r = reg.exec(fieldFilter.show_if);

          let filterName = r[1];
          let fractionControlName = r[2];
          let controlValue = r[3];

          if (fieldFilter.name === filterName) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.SHOW_IF_FILTER_SELF_REFERENCE,
                message: 'filter show_if can not reference itself',
                lines: [
                  {
                    line: fieldFilter.show_if_line_num,
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }
        }

        fieldFilter.fraction_controls
          .filter(y => common.isDefined(y.show_if))
          .forEach(control => {
            let regB = common.MyRegex.CAPTURE_TRIPLE_REF_FOR_SHOW_IF_G();

            let rB = regB.exec(control.show_if);

            let filterNameB = rB[1];
            let fractionControlNameB = rB[2];
            let controlValueB = rB[3];

            if (
              fieldFilter.name === filterNameB &&
              control.name === fractionControlNameB
            ) {
              item.errors.push(
                new BmError({
                  title:
                    common.ErTitleEnum.SHOW_IF_FRACTION_CONTROL_SELF_REFERENCE,
                  message: 'control show_if can not reference itself',
                  lines: [
                    {
                      line: control.show_if_line_num,
                      name: x.fileName,
                      path: x.filePath
                    }
                  ]
                })
              );
              return;
            }
          });
      });

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
