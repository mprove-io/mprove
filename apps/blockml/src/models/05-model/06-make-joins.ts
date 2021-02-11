import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = enums.FuncEnum.MakeJoins;

export function makeJoins(
  item: {
    models: interfaces.Model[];
    views: interfaces.View[];
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

    x.joins.forEach(j => {
      let viewName = j.as === x.fromAs ? j.from_view : j.join_view;

      let view = item.views.find(v => v.name === viewName);

      let errorLine =
        j.as === x.fromAs ? j.from_view_line_num : j.join_view_line_num;

      if (common.isUndefined(view)) {
        item.errors.push(
          new BmError({
            title: enums.ErTitleEnum.JOIN_CALLS_MISSING_VIEW,
            message: `${common.FileExtensionEnum.View} "${viewName}" is missing or not valid`,
            lines: [
              {
                line: errorLine,
                name: x.fileName,
                path: x.filePath
              }
            ]
          })
        );
        return;
      }

      if (view.connection.connectionId !== x.connection.connectionId) {
        item.errors.push(
          new BmError({
            title:
              enums.ErTitleEnum.JOIN_REFERENCED_VIEW_HAS_DIFFERENT_CONNECTION,
            message:
              `The ${common.FileExtensionEnum.Model} can refer to views ` +
              `with the same connection name. Model "${x.name}" with connection ` +
              `"${x.connection.connectionId}" references view "${view.name}" ` +
              `with connection "${view.connection.connectionId}"`,
            lines: [
              {
                line: errorLine,
                name: x.fileName,
                path: x.filePath
              }
            ]
          })
        );
        return;
      }

      let viewLabel = view.label;
      let viewDescription = view.description;

      j.view = common.makeCopy(view);

      j.label = common.isDefined(j.label) ? j.label : viewLabel;

      j.label_line_num = common.isDefined(j.label_line_num)
        ? j.label_line_num
        : 0;

      j.description = common.isDefined(j.description)
        ? j.description
        : viewDescription;

      j.description_line_num = common.isDefined(j.description_line_num)
        ? j.description_line_num
        : 0;
    });

    if (errorsOnStart === item.errors.length) {
      newModels.push(x);
    }
  });

  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Models, newModels);

  return newModels;
}
