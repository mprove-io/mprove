import { ConfigService } from '@nestjs/config';
import { api } from '~blockml/barrels/api';
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

      if (helper.isUndefined(view)) {
        item.errors.push(
          new BmError({
            title: enums.ErTitleEnum.JOIN_CALLS_MISSING_VIEW,
            message: `${api.FileExtensionEnum.View} "${viewName}" is missing or not valid`,
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

      if (view.connection.name !== x.connection.name) {
        item.errors.push(
          new BmError({
            title:
              enums.ErTitleEnum.JOIN_REFERENCED_VIEW_HAS_DIFFERENT_CONNECTION,
            message:
              `The ${api.FileExtensionEnum.Model} can refer to views ` +
              `with the same connection name. Model "${x.name}" with connection ` +
              `"${x.connection.name}" references view "${view.name}" ` +
              `with connection "${view.connection.name}"`,
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

      j.view = helper.makeCopy(view);

      j.label = helper.isDefined(j.label) ? j.label : viewLabel;

      j.label_line_num = helper.isDefined(j.label_line_num)
        ? j.label_line_num
        : 0;

      j.description = helper.isDefined(j.description)
        ? j.description
        : viewDescription;

      j.description_line_num = helper.isDefined(j.description_line_num)
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
