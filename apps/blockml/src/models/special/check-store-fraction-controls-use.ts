import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.CheckStoreFractionControlsUse;

export function checkStoreFractionControlsUse(
  item: {
    storeControls: common.FileStoreFractionControl[];
    controls: common.FileStoreFractionControl[];
    controlsLineNum: number;
    fileName: string;
    filePath: string;
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId, storeControls } = item;
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Input, item);

  item.controls.forEach(control => {
    let storeControl = storeControls.find(x => x.name === control.name);

    if (common.isUndefined(storeControl)) {
      item.errors.push(
        new BmError({
          title: common.ErTitleEnum.FRACTION_CONTROL_MISSING_STORE_CONTROL,
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

    if (
      common.isUndefined(storeControl.controlClass !== control.controlClass)
    ) {
      item.errors.push(
        new BmError({
          title: common.ErTitleEnum.FRACTION_CONTROL_CLASS_MISMATCH,
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
      common.isUndefined(
        control.controlClass === common.ControlClassEnum.Selector &&
          storeControl.options
            .map(option => option.value)
            .indexOf(control.value) < 0
      )
    ) {
      item.errors.push(
        new BmError({
          title:
            common.ErTitleEnum.FRACTION_CONTROL_SELECTOR_VALUE_MISSING_OPTION,
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
      common.isUndefined(
        control.controlClass === common.ControlClassEnum.Switch &&
          !control.value.match(common.MyRegex.TRUE_FALSE())
      )
    ) {
      item.errors.push(
        new BmError({
          title: common.ErTitleEnum.FRACTION_CONTROL_WRONG_SWITCH_VALUE,
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
