import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.CheckStoreRequiredParameters;

export function checkStoreRequiredParameters(
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

    if (common.isUndefined(x.method)) {
      item.errors.push(
        new BmError({
          title: common.ErTitleEnum.MISSING_METHOD,
          message: `parameter "${common.ParameterEnum.Method}" is required for ${x.fileExt} file`,
          lines: [
            {
              line: 0,
              name: x.fileName,
              path: x.filePath
            }
          ]
        })
      );
      return;
    }

    if (common.isUndefined(x.body)) {
      item.errors.push(
        new BmError({
          title: common.ErTitleEnum.MISSING_BODY,
          message: `parameter "${common.ParameterEnum.Body}" is required for ${x.fileExt} file`,
          lines: [
            {
              line: 0,
              name: x.fileName,
              path: x.filePath
            }
          ]
        })
      );
      return;
    }

    if (common.isUndefined(x.response)) {
      item.errors.push(
        new BmError({
          title: common.ErTitleEnum.MISSING_RESPONSE,
          message: `parameter "${common.ParameterEnum.Response}" is required for ${x.fileExt} file`,
          lines: [
            {
              line: 0,
              name: x.fileName,
              path: x.filePath
            }
          ]
        })
      );
      return;
    }

    if (
      common.STORE_METHOD_VALUES.map(v => v.toString()).indexOf(x.method) < 0
    ) {
      item.errors.push(
        new BmError({
          title: common.ErTitleEnum.WRONG_METHOD,
          message: `${common.ParameterEnum.Method} value must be "POST" or "GET"`,
          lines: [
            {
              line: x.method_line_num,
              name: x.fileName,
              path: x.filePath
            }
          ]
        })
      );
      return;
    }

    if (
      common.isDefined(x.date_range_includes_right_side) &&
      !x.date_range_includes_right_side.match(common.MyRegex.TRUE_FALSE())
    ) {
      item.errors.push(
        new BmError({
          title: common.ErTitleEnum.WRONG_DATE_RANGE_INCLUDES_RIGHT_SIDE,
          message: `parameter "${common.ParameterEnum.DateRangeIncludesRightSide}" must be 'true' or 'false' if specified`,
          lines: [
            {
              line: x.date_range_includes_right_side_line_num,
              name: x.fileName,
              path: x.filePath
            }
          ]
        })
      );
      return;
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
