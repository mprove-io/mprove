import { helper } from '../../barrels/helper';
import { enums } from '../../barrels/enums';
import { interfaces } from '../../barrels/interfaces';
import { BmError } from '../bm-error';

let func = enums.FuncEnum.PickUdfsFromAsDeps;

export function pickUdfsFromAsDeps(item: {
  views: interfaces.View[];
  errors: BmError[];
  structId: string;
  caller: enums.CallerEnum;
}) {
  let { caller, structId } = item;
  helper.log(caller, func, structId, enums.LogTypeEnum.Input, item);

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

        if (helper.isDefined(view.udfs) && view.udfs.length > 0) {
          view.udfs.forEach(udfName => {
            linkedUdfs[udfName] = 1;
          });
        }
      });

      x.udfs = Object.keys(linkedUdfs);
    }
  });

  helper.log(caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(caller, func, structId, enums.LogTypeEnum.Views, item.views);

  return item.views;
}
