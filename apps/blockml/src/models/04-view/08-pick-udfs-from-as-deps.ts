import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.PickUdfsFromAsDeps;

export function pickUdfsFromAsDeps(
  item: {
    views: common.FileView[];
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Input, item);

  item.views.forEach(x => {
    if (Object.keys(x.asDeps).length > 0) {
      let linkedViews: { [view: string]: number } = {};

      linkedViews[x.name] = 1;

      let run = true;

      while (run) {
        let startLength = Object.keys(linkedViews).length;

        Object.keys(linkedViews).forEach(name => {
          let view = item.views.find(v => v.name === name);

          Object.keys(view.asDeps).forEach(as => {
            let referencedViewName = view.asDeps[as].viewName;

            linkedViews[referencedViewName] = 1;
          });
        });

        let endLength = Object.keys(linkedViews).length;

        if (startLength === endLength) {
          run = false;
        }
      }

      let linkedUdfs: { [udf: string]: number } = {};

      Object.keys(linkedViews).forEach(name => {
        let view = item.views.find(v => v.name === name);

        if (common.isDefined(view.udfs) && view.udfs.length > 0) {
          view.udfs.forEach(udfName => {
            linkedUdfs[udfName] = 1;
          });
        }
      });

      x.udfs = Object.keys(linkedUdfs);
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
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Views, item.views);

  return item.views;
}
