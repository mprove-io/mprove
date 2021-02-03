import { ConfigService } from '@nestjs/config';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = enums.FuncEnum.CheckModelUdfs;

export function checkModelUdfs(
  item: {
    models: interfaces.Model[];
    udfs: interfaces.Udf[];
    errors: BmError[];
    structId: string;
    caller: enums.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Input, item);

  let newModels: interfaces.Model[] = [];

  item.models.forEach(x => {
    let errorsOnStart = item.errors.length;

    if (helper.isDefined(x.udfs)) {
      x.udfs.forEach(u => {
        if (item.udfs.findIndex(udf => udf.name === u) < 0) {
          item.errors.push(
            new BmError({
              title: enums.ErTitleEnum.WRONG_MODEL_UDF,
              message: `found element "- ${u}" references missing or not valid ${enums.ParameterEnum.Udf}`,
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

  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Models, newModels);

  return newModels;
}
