import { ConfigService } from '@nestjs/config';
import { api } from '~/barrels/api';
import { constants } from '~/barrels/constants';
import { enums } from '~/barrels/enums';
import { helper } from '~/barrels/helper';
import { interfaces } from '~/barrels/interfaces';
import { BmError } from '~/models/bm-error';

let func = enums.FuncEnum.CheckJoinUnknownParameters;

export function checkJoinUnknownParameters(
  item: {
    models: interfaces.Model[];
    errors: BmError[];
    structId: string;
    caller: enums.CallerEnum;
  },
  cs: ConfigService
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Input, item);

  let newModels: interfaces.Model[] = [];

  item.models.forEach(x => {
    let errorsOnStart = item.errors.length;

    x.joins.forEach(join => {
      Object.keys(join)
        .filter(
          k =>
            !k.match(api.MyRegex.ENDS_WITH_LINE_NUM()) &&
            [enums.ParameterEnum.View.toString()].indexOf(k) < 0
        )
        .forEach(parameter => {
          if (
            parameter === enums.ParameterEnum.Hidden.toString() &&
            !join[parameter].toString().match(api.MyRegex.TRUE_FALSE())
          ) {
            item.errors.push(
              new BmError({
                title: enums.ErTitleEnum.JOIN_WRONG_HIDDEN,
                message: `parameter "${enums.ParameterEnum.Hidden}" must be \'true\' or \'false\' if specified`,
                lines: [
                  {
                    line: join[parameter + constants.LINE_NUM],
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }

          if (
            join.as === x.fromAs &&
            [
              enums.ParameterEnum.FromView.toString(),
              enums.ParameterEnum.Hidden.toString(),
              enums.ParameterEnum.Label.toString(),
              enums.ParameterEnum.Description.toString(),
              enums.ParameterEnum.As.toString(),
              enums.ParameterEnum.HideFields.toString(),
              enums.ParameterEnum.ShowFields.toString()
            ].indexOf(parameter) < 0
          ) {
            item.errors.push(
              new BmError({
                title: enums.ErTitleEnum.JOIN_UNKNOWN_PARAMETER_FOR_FROM_VIEW,
                message:
                  `parameter "${parameter}" can not be used ` +
                  `with "${enums.ParameterEnum.FromView}"`,
                lines: [
                  {
                    line: join[parameter + constants.LINE_NUM],
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }

          if (
            join.as !== x.fromAs &&
            [
              enums.ParameterEnum.JoinView.toString(),
              enums.ParameterEnum.Hidden.toString(),
              enums.ParameterEnum.Label.toString(),
              enums.ParameterEnum.Description.toString(),
              enums.ParameterEnum.As.toString(),
              enums.ParameterEnum.Type.toString(),
              enums.ParameterEnum.SqlOn.toString(),
              enums.ParameterEnum.SqlWhere.toString(),
              enums.ParameterEnum.HideFields.toString(),
              enums.ParameterEnum.ShowFields.toString()
            ].indexOf(parameter) < 0
          ) {
            item.errors.push(
              new BmError({
                title: enums.ErTitleEnum.JOIN_UNKNOWN_PARAMETER_FOR_JOIN_VIEW,
                message:
                  `parameter "${parameter}" can not be used ` +
                  `with "${enums.ParameterEnum.JoinView}"`,
                lines: [
                  {
                    line: join[parameter + constants.LINE_NUM],
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }

          if (
            Array.isArray(join[parameter]) &&
            [
              enums.ParameterEnum.HideFields.toString(),
              enums.ParameterEnum.ShowFields.toString()
            ].indexOf(parameter) < 0
          ) {
            item.errors.push(
              new BmError({
                title: enums.ErTitleEnum.JOIN_UNEXPECTED_LIST,
                message: `parameter '${parameter}' must have a single value`,
                lines: [
                  {
                    line: join[parameter + constants.LINE_NUM],
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }

          if (join[parameter]?.constructor === Object) {
            item.errors.push(
              new BmError({
                title: enums.ErTitleEnum.JOIN_UNEXPECTED_DICTIONARY,
                message: `parameter '${parameter}' must have a single value`,
                lines: [
                  {
                    line: join[parameter + constants.LINE_NUM],
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }

          if (
            !Array.isArray(join[parameter]) &&
            [
              enums.ParameterEnum.HideFields.toString(),
              enums.ParameterEnum.ShowFields.toString()
            ].indexOf(parameter) > -1
          ) {
            item.errors.push(
              new BmError({
                title: enums.ErTitleEnum.JOIN_PARAMETER_IS_NOT_A_LIST,
                message: `parameter "${parameter}" must be a List`,
                lines: [
                  {
                    line: join[parameter + constants.LINE_NUM],
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }
        });
    });

    if (errorsOnStart === item.errors.length) {
      newModels.push(x);
    }
  });

  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Models, newModels);

  return newModels;
}
