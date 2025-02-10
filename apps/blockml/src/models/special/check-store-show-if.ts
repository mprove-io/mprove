import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { types } from '~blockml/barrels/types';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.CheckStoreShowIf;

export function checkStoreShowIf<T extends types.showIfType>(
  item: {
    showIfParentEntities: T[];
    filters: common.FieldStoreFilter[];
    fileName: string;
    filePath: string;
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Input, item);

  let newEntities: T[] = [];

  item.showIfParentEntities
    .filter(y => common.isDefined(y.show_if))
    .forEach(x => {
      let errorsOnStart = item.errors.length;

      let reg = common.MyRegex.CAPTURE_TRIPLE_REF_FOR_SHOW_IF_G();

      let r = reg.exec(x.show_if);

      if (common.isUndefined(r)) {
        item.errors.push(
          new BmError({
            title: common.ErTitleEnum.WRONG_SHOW_IF,
            message:
              'show_if must be in the format "filter_name.fraction_control_name.control_value"',
            lines: [
              {
                line: x.show_if_line_num,
                name: item.fileName,
                path: item.filePath
              }
            ]
          })
        );
        return;
      }

      let filterName = r[1];
      let fractionControlName = r[2];
      let controlValue = r[3];

      let filter = item.filters.find(f => f.name === filterName);

      if (common.isUndefined(filter)) {
        item.errors.push(
          new BmError({
            title: common.ErTitleEnum.SHOW_IF_REFS_MISSING_OR_NOT_VALID_FILTER,
            message: `filter "${filterName}" is missing or not valid`,
            lines: [
              {
                line: x.show_if_line_num,
                name: item.fileName,
                path: item.filePath
              }
            ]
          })
        );
        return;
      }

      let fractionControl = filter.fraction_controls.find(
        c => c.name === fractionControlName
      );

      if (common.isUndefined(fractionControl)) {
        item.errors.push(
          new BmError({
            title:
              common.ErTitleEnum
                .SHOW_IF_REFS_MISSING_OR_NOT_VALID_FRACTION_CONTROL,
            message: `fraction control "${fractionControlName}" is missing or not valid`,
            lines: [
              {
                line: x.show_if_line_num,
                name: item.fileName,
                path: item.filePath
              }
            ]
          })
        );
        return;
      }

      if (errorsOnStart === item.errors.length) {
        newEntities.push(x);
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
  helper.log(
    cs,
    caller,
    func,
    structId,
    common.LogTypeEnum.Entities,
    newEntities
  );

  return newEntities;
}
