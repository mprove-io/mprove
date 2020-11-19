import { helper } from '../../barrels/helper';
import { enums } from '../../barrels/enums';
import { BmError } from '../bm-error';
import { interfaces } from '../../barrels/interfaces';

let func = enums.FuncEnum.CheckViewUdfs;

export function checkViewUdfs(item: {
  views: interfaces.View[];
  udfs: interfaces.Udf[];
  errors: BmError[];
  structId: string;
  caller: enums.CallerEnum;
}) {
  let { caller, structId } = item;
  helper.log(caller, func, structId, enums.LogTypeEnum.Input, item);

  let newViews: interfaces.View[] = [];

  item.views.forEach(x => {
    let errorsOnStart = item.errors.length;

    if (helper.isDefined(x.udfs)) {
      x.udfs.forEach(u => {
        if (item.udfs.findIndex(udf => udf.name === u) < 0) {
          item.errors.push(
            new BmError({
              title: enums.ErTitleEnum.WRONG_UDF,
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

    let errorsOnEnd = item.errors.length;
    if (errorsOnStart === errorsOnEnd) {
      newViews.push(x);
    }
  });

  helper.log(caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(caller, func, structId, enums.LogTypeEnum.Views, newViews);

  return newViews;
}