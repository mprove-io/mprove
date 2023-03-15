import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.JsoCheckSingleRefs;

export function jsoCheckSingleRefs(
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

    x.joins
      .filter(j => j.as !== x.fromAs)
      .forEach(join => {
        let reg = common.MyRegex.CAPTURE_SINGLE_REF_G();
        let r;

        let references: string[] = [];

        while ((r = reg.exec(join.sql_on))) {
          references.push(r[1]);
        }

        references.forEach(reference => {
          let referenceField = x.fields.find(f => f.name === reference);

          if (common.isUndefined(referenceField)) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.JOIN_SQL_ON_REFS_MODEL_MISSING_FIELD,
                message: `field "${reference}" is missing or not valid`,
                lines: [
                  {
                    line: join.sql_on_line_num,
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }

          if (referenceField.fieldClass === common.FieldClassEnum.Filter) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.JOIN_SQL_ON_REFS_MODEL_FILTER,
                message:
                  `"${common.ParameterEnum.SqlOn}" can not reference filters. ` +
                  `Found referencing "${reference}".`,
                lines: [
                  {
                    line: join.sql_on_line_num,
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }

          if (referenceField.fieldClass === common.FieldClassEnum.Calculation) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.JOIN_SQL_ON_REFS_MODEL_CALCULATION,
                message:
                  `"${common.ParameterEnum.SqlOn}" can not reference calculations. ` +
                  `Found referencing "${reference}".`,
                lines: [
                  {
                    line: join.sql_on_line_num,
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }

          if (referenceField.fieldClass === common.FieldClassEnum.Measure) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.JOIN_SQL_ON_REFS_MODEL_MEASURE,
                message:
                  `"${common.ParameterEnum.SqlOn}" can not reference measures. ` +
                  `Found referencing "${reference}".`,
                lines: [
                  {
                    line: join.sql_on_line_num,
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
