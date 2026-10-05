import { ConfigService } from '@nestjs/config';
import { BmError } from '#blockml/classes/bm-error/bm-error';
import { BlockmlConfig } from '#blockml/config/blockml-config';
import { log } from '#blockml/functions/log/log';
import { MyRegex } from '#common/classes/my-regex/my-regex';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { Caller } from '#common/types/blockml/diagnostics/caller';
import type { Func } from '#common/types/blockml/diagnostics/func';
import { type FileParameter } from '#common/types/blockml/parts/file/file-parameter';
import type { FileStore } from '#common/types/blockml/parts/internal/file-store';
import { storeMethodValues } from '#common/types/blockml/parts/store/store-method';

let func: Func = 'build-store-next/check-store-required-parameters';

export function checkStoreRequiredParameters(
  item: {
    stores: FileStore[];
    errors: BmError[];
    structId: string;
    caller: Caller;
  },
  cs: ConfigService<BlockmlConfig>
) {
  let { caller, structId } = item;
  log(cs, caller, func, structId, 'input.log', item);

  let newStores: FileStore[] = [];

  item.stores.forEach(x => {
    let errorsOnStart = item.errors.length;

    if (isUndefined(x.method)) {
      item.errors.push(
        new BmError({
          title: 'MISSING_METHOD',
          message: `parameter "${'method' satisfies FileParameter}" is required for ${x.fileExt} file`,
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
          title: 'MISSING_REQUEST',
          message: `parameter "${'request' satisfies FileParameter}" is required for ${x.fileExt} file`,
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
          title: 'MISSING_RESPONSE',
          message: `parameter "${'response' satisfies FileParameter}" is required for ${x.fileExt} file`,
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

    if (storeMethodValues.findIndex(candidate => candidate === x.method) < 0) {
      item.errors.push(
        new BmError({
          title: 'WRONG_METHOD',
          message: `${'method' satisfies FileParameter} value must be "POST" or "GET"`,
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
          title: 'WRONG_DATE_RANGE_INCLUDES_RIGHT_SIDE',
          message: `parameter "${'date_range_includes_right_side' satisfies FileParameter}" must be 'true' or 'false' if specified`,
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

  log(cs, caller, func, structId, 'out_errors.log', item.errors);
  log(cs, caller, func, structId, 'out_stores.log', newStores);

  return newStores;
}
