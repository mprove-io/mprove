import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.CheckModelUdfs;

export function checkModelUdfs(
  item: {
    models: common.FileModel[];
    udfs: common.FileUdf[];
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Input, item);

  let newModels: common.FileModel[] = [];

  item.models.forEach(x => {
    let errorsOnStart = item.errors.length;

    if (common.isDefined(x.udfs)) {
      x.udfs.forEach(u => {
        if (item.udfs.findIndex(udf => udf.name === u) < 0) {
          item.errors.push(
            new BmError({
              title: common.ErTitleEnum.WRONG_MODEL_UDF,
              message: `found element "- ${u}" references missing or not valid ${common.ParameterEnum.Udf}`,
              lines: [
                {
                  line: x.udfs_line_num,
                  name: x.fileName,
                  path: x.filePath
                }
              ]
            })
          );
          return;
        }
      });
    }

    if (errorsOnStart === item.errors.length) {
      newModels.push(x);
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
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Models, newModels);

  return newModels;
}
