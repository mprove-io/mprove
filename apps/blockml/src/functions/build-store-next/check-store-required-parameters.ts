import { ConfigService } from '@nestjs/config';
import { STORE_METHOD_VALUES } from '#common/constants/top';
import { ParameterEnum } from '#common/enums/docs/parameter.enum';
import { CallerEnum } from '#common/enums/special/caller.enum';
import { ErTitleEnum } from '#common/enums/special/er-title.enum';
import { FuncEnum } from '#common/enums/special/func.enum';
import { LogTypeEnum } from '#common/enums/special/log-type.enum';
import { isDefined } from '#common/functions/is-defined';
import { isUndefined } from '#common/functions/is-undefined';
import { FileStore } from '#common/interfaces/blockml/internal/file-store';
import { MyRegex } from '#common/models/my-regex';
import { BlockmlConfig } from '~blockml/config/blockml-config';
import { BmError } from '~blockml/models/bm-error';
import { log } from '../extra/log';

let func = FuncEnum.CheckStoreRequiredParameters;

export function checkStoreRequiredParameters(
  item: {
    stores: FileStore[];
    errors: BmError[];
    structId: string;
    caller: CallerEnum;
  },
  cs: ConfigService<BlockmlConfig>
) {
  let { caller, structId } = item;
  log(cs, caller, func, structId, LogTypeEnum.Input, item);

  let newStores: FileStore[] = [];

  item.stores.forEach(x => {
    let errorsOnStart = item.errors.length;

    if (isUndefined(x.method)) {
      item.errors.push(
        new BmError({
          title: ErTitleEnum.MISSING_METHOD,
          message: `parameter "${ParameterEnum.Method}" is required for ${x.fileExt} file`,
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

    if (isUndefined(x.request)) {
      item.errors.push(
        new BmError({
          title: ErTitleEnum.MISSING_REQUEST,
          message: `parameter "${ParameterEnum.Request}" is required for ${x.fileExt} file`,
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

    if (isUndefined(x.response)) {
      item.errors.push(
        new BmError({
          title: ErTitleEnum.MISSING_RESPONSE,
          message: `parameter "${ParameterEnum.Response}" is required for ${x.fileExt} file`,
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

    if (STORE_METHOD_VALUES.map(v => v.toString()).indexOf(x.method) < 0) {
      item.errors.push(
        new BmError({
          title: ErTitleEnum.WRONG_METHOD,
          message: `${ParameterEnum.Method} value must be "POST" or "GET"`,
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
      isDefined(x.date_range_includes_right_side) &&
      !x.date_range_includes_right_side.match(MyRegex.TRUE_FALSE())
    ) {
      item.errors.push(
        new BmError({
          title: ErTitleEnum.WRONG_DATE_RANGE_INCLUDES_RIGHT_SIDE,
          message: `parameter "${ParameterEnum.DateRangeIncludesRightSide}" must be 'true' or 'false' if specified`,
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

  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);
  log(cs, caller, func, structId, LogTypeEnum.Stores, newStores);

  return newStores;
}
