import { ConfigService } from '@nestjs/config';
import { BmError } from '#blockml/classes/bm-error/bm-error';
import { BlockmlConfig } from '#blockml/config/blockml-config';
import { log } from '#blockml/functions/log/log';
import { MyRegex } from '#common/classes/my-regex/my-regex';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { Caller } from '#common/types/blockml/diagnostics/caller';
import type { Func } from '#common/types/blockml/diagnostics/func';
import type { FileStoreFractionControl } from '#common/types/blockml/parts/internal/file-store-fraction-control';

let func: Func = 'extra/check-store-fraction-controls-use';

export function checkStoreFractionControlsUse(
  item: {
    storeControls: FileStoreFractionControl[];
    controls: FileStoreFractionControl[];
    controlsLineNum: number;
    fileName: string;
    filePath: string;
    errors: BmError[];
    structId: string;
    caller: Caller;
  },
  cs: ConfigService<BlockmlConfig>
) {
  let { caller, structId, storeControls } = item;
  log(cs, caller, func, structId, 'input.log', item);

  item.controls.forEach(control => {
    let storeControl = storeControls.find(x => x.name === control.name);

    if (isUndefined(storeControl)) {
      item.errors.push(
        new BmError({
          title: 'FRACTION_CONTROL_REFS_MISSING_STORE_CONTROL',
          message: `store control "${control.name}" is missing or not valid`,
          lines: [
            {
              line: control.name_line_num,
              name: item.fileName,
              path: item.filePath
            }
          ]
        })
      );
      return;
    }

    if (storeControl.controlClass !== control.controlClass) {
      item.errors.push(
        new BmError({
          title: 'FRACTION_CONTROL_CLASS_MISMATCH',
          message: `control type "${control.controlClass}" does not match store control type "${storeControl.controlClass}"`,
          lines: [
            {
              line: control.name_line_num,
              name: item.fileName,
              path: item.filePath
            }
          ]
        })
      );
      return;
    }

    if (
      control.controlClass === 'selector' &&
      storeControl.options.map(option => option.value).indexOf(control.value) <
        0
    ) {
      item.errors.push(
        new BmError({
          title: 'FRACTION_CONTROL_SELECTOR_VALUE_MISSING_OPTION',
          message: `selector value "${control.value}" does not match options`,
          lines: [
            {
              line: control.name_line_num,
              name: item.fileName,
              path: item.filePath
            }
          ]
        })
      );
      return;
    }

    if (
      control.controlClass === 'switch' &&
      !control.value.match(MyRegex.TRUE_FALSE())
    ) {
      item.errors.push(
        new BmError({
          title: 'FRACTION_CONTROL_WRONG_SWITCH_VALUE',
          message: `switch value must be 'true' or 'false' if specified`,
          lines: [
            {
              line: control.name_line_num,
              name: item.fileName,
              path: item.filePath
            }
          ]
        })
      );
      return;
    }
  });

  return item.errors;
}
