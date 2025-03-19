import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.CheckStoreFractionControls;

export function checkTopParameters(
  item: {
    fields: common.FieldFilter[];
    parametersLineNum: number;
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

  item.fields.forEach(field => {
    // let fieldLineNums: number[] = Object.keys(field)
    //   .filter(y => y.match(common.MyRegex.ENDS_WITH_LINE_NUM()))
    //   .map(y => field[y as keyof common.FieldFilter] as number);

    if (common.isDefined(field.result) && common.isDefined(field.store)) {
      item.errors.push(
        new BmError({
          title: common.ErTitleEnum.TOP_PARAMETER_RESULT_AND_STORE,
          message: `top parameter "result" and "store" do not work together`,
          lines: [
            {
              line: field.result_line_num,
              name: item.fileName,
              path: item.filePath
            },
            {
              line: field.store_line_num,
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
