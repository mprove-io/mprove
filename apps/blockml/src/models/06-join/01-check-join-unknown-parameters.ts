import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.CheckJoinUnknownParameters;

export function checkJoinUnknownParameters(
  item: {
    models: common.FileModel[];
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

    x.joins.forEach(join => {
      Object.keys(join)
        .filter(
          k =>
            !k.match(common.MyRegex.ENDS_WITH_LINE_NUM()) &&
            [common.ParameterEnum.View.toString()].indexOf(k) < 0
        )
        .forEach(parameter => {
          if (
            parameter === common.ParameterEnum.Hidden.toString() &&
            !join[parameter as keyof common.FileJoin]
              .toString()
              .match(common.MyRegex.TRUE_FALSE())
          ) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.JOIN_WRONG_HIDDEN,
                message: `parameter "${common.ParameterEnum.Hidden}" must be \'true\' or \'false\' if specified`,
                lines: [
                  {
                    line: join[
                      (parameter + constants.LINE_NUM) as keyof common.FileJoin
                    ] as number,
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
              common.ParameterEnum.FromView.toString(),
              common.ParameterEnum.Hidden.toString(),
              common.ParameterEnum.Label.toString(),
              common.ParameterEnum.Description.toString(),
              common.ParameterEnum.As.toString(),
              common.ParameterEnum.HideFields.toString(),
              common.ParameterEnum.ShowFields.toString()
            ].indexOf(parameter) < 0
          ) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.JOIN_UNKNOWN_PARAMETER_FOR_FROM_VIEW,
                message:
                  `parameter "${parameter}" cannot be used ` +
                  `with "${common.ParameterEnum.FromView}"`,
                lines: [
                  {
                    line: join[
                      (parameter + constants.LINE_NUM) as keyof common.FileJoin
                    ] as number,
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
              common.ParameterEnum.JoinView.toString(),
              common.ParameterEnum.Relationship.toString(),
              common.ParameterEnum.Hidden.toString(),
              common.ParameterEnum.Label.toString(),
              common.ParameterEnum.Description.toString(),
              common.ParameterEnum.As.toString(),
              common.ParameterEnum.Type.toString(),
              common.ParameterEnum.SqlOn.toString(),
              common.ParameterEnum.SqlWhere.toString(),
              common.ParameterEnum.HideFields.toString(),
              common.ParameterEnum.ShowFields.toString()
            ].indexOf(parameter) < 0
          ) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.JOIN_UNKNOWN_PARAMETER_FOR_JOIN_VIEW,
                message:
                  `parameter "${parameter}" cannot be used ` +
                  `with "${common.ParameterEnum.JoinView}"`,
                lines: [
                  {
                    line: join[
                      (parameter + constants.LINE_NUM) as keyof common.FileJoin
                    ] as number,
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }

          if (
            Array.isArray(join[parameter as keyof common.FileJoin]) &&
            [
              common.ParameterEnum.HideFields.toString(),
              common.ParameterEnum.ShowFields.toString()
            ].indexOf(parameter) < 0
          ) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.JOIN_UNEXPECTED_LIST,
                message: `parameter '${parameter}' must have a single value`,
                lines: [
                  {
                    line: join[
                      (parameter + constants.LINE_NUM) as keyof common.FileJoin
                    ] as number,
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }

          if (
            join[parameter as keyof common.FileJoin]?.constructor === Object
          ) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.JOIN_UNEXPECTED_DICTIONARY,
                message: `parameter '${parameter}' must have a single value`,
                lines: [
                  {
                    line: join[
                      (parameter + constants.LINE_NUM) as keyof common.FileJoin
                    ] as number,
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }

          if (
            !Array.isArray(join[parameter as keyof common.FileJoin]) &&
            [
              common.ParameterEnum.HideFields.toString(),
              common.ParameterEnum.ShowFields.toString()
            ].indexOf(parameter) > -1
          ) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.JOIN_PARAMETER_IS_NOT_A_LIST,
                message: `parameter "${parameter}" must be a List`,
                lines: [
                  {
                    line: join[
                      (parameter + constants.LINE_NUM) as keyof common.FileJoin
                    ] as number,
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
