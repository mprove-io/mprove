import { ConfigService } from '@nestjs/config';
import { BlockmlConfig } from '#blockml/config/blockml-config';
import { BmError } from '#blockml/models/bm-error';
import { ControlClassEnum } from '#common/enums/control-class.enum';
import { CallerEnum } from '#common/enums/special/caller.enum';
import { ErTitleEnum } from '#common/enums/special/er-title.enum';
import { FuncEnum } from '#common/enums/special/func.enum';
import { LogTypeEnum } from '#common/enums/special/log-type.enum';
import { isUndefined } from '#common/functions/is-undefined';
import { FileStoreFractionControl } from '#common/interfaces/blockml/internal/file-store-fraction-control';
import { MyRegex } from '#common/models/my-regex';
import { log } from './log';

let func = FuncEnum.CheckStoreFractionControlsUse;

export function checkStoreFractionControlsUse(
  item: {
    storeControls: FileStoreFractionControl[];
    controls: FileStoreFractionControl[];
    controlsLineNum: number;
    fileName: string;
    filePath: string;
    errors: BmError[];
    structId: string;
    caller: CallerEnum;
  },
  cs: ConfigService<BlockmlConfig>
) {
  let { caller, structId, storeControls } = item;
  log(cs, caller, func, structId, LogTypeEnum.Input, item);

  item.controls.forEach(control => {
    let storeControl = storeControls.find(x => x.name === control.name);

    if (isUndefined(storeControl)) {
      item.errors.push(
        new BmError({
          title: ErTitleEnum.FRACTION_CONTROL_REFS_MISSING_STORE_CONTROL,
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
          title: ErTitleEnum.FRACTION_CONTROL_CLASS_MISMATCH,
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
      control.controlClass === ControlClassEnum.Selector &&
      storeControl.options.map(option => option.value).indexOf(control.value) <
        0
    ) {
      item.errors.push(
        new BmError({
          title: ErTitleEnum.FRACTION_CONTROL_SELECTOR_VALUE_MISSING_OPTION,
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
      control.controlClass === ControlClassEnum.Switch &&
      !control.value.match(MyRegex.TRUE_FALSE())
    ) {
      item.errors.push(
        new BmError({
          title: ErTitleEnum.FRACTION_CONTROL_WRONG_SWITCH_VALUE,
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
