import { ConfigService } from '@nestjs/config';
import { apiToBlockml } from '~blockml/barrels/api-to-blockml';
import { common } from '~blockml/barrels/common';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { types } from '~blockml/barrels/types';
import { BmError } from '~blockml/models/bm-error';

let func = enums.FuncEnum.CheckFieldsDeps;

export function checkFieldsDeps<T extends types.vmType>(
  item: {
    entities: T[];
    errors: BmError[];
    structId: string;
    caller: enums.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
): T[] {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Input, item);

  let newEntities: T[] = [];

  item.entities.forEach(x => {
    let errorsOnStart = item.errors.length;

    if (x.fileExt === common.FileExtensionEnum.Dashboard) {
      newEntities.push(x);
      return;
    }

    x.fields.forEach(field => {
      Object.keys(x.fieldsDeps[field.name]).forEach(depName => {
        let dependentField = x.fields.find(f => f.name === depName);

        if (common.isUndefined(dependentField)) {
          item.errors.push(
            new BmError({
              title: enums.ErTitleEnum.REFERENCE_TO_NOT_VALID_FIELD,
              message: `field "${depName}" is missing or not valid`,
              lines: [
                {
                  line: x.fieldsDeps[field.name][depName],
                  name: x.fileName,
                  path: x.filePath
                }
              ]
            })
          );
          return;
        } else if (dependentField.name === field.name) {
          item.errors.push(
            new BmError({
              title: enums.ErTitleEnum.FIELD_SELF_REFERENCE,
              message: 'field can not reference to itself',
              lines: [
                {
                  line: x.fieldsDeps[field.name][depName],
                  name: x.fileName,
                  path: x.filePath
                }
              ]
            })
          );
          return;
        } else if (
          dependentField.fieldClass === apiToBlockml.FieldClassEnum.Filter
        ) {
          item.errors.push(
            new BmError({
              title: enums.ErTitleEnum.FIELD_REFS_FILTER,
              message:
                'Filters can not be referenced through $. ' +
                `Found field "${field.name}" is referencing filter "${depName}".`,
              lines: [
                {
                  line: x.fieldsDeps[field.name][depName],
                  name: x.fileName,
                  path: x.filePath
                }
              ]
            })
          );
          return;
        } else if (
          field.fieldClass === apiToBlockml.FieldClassEnum.Dimension &&
          dependentField.fieldClass === apiToBlockml.FieldClassEnum.Measure
        ) {
          item.errors.push(
            new BmError({
              title: enums.ErTitleEnum.DIMENSION_REFS_MEASURE,
              message:
                'Dimensions can not reference measures. ' +
                `Found dimension "${field.name}" is referencing measure "${depName}".`,
              lines: [
                {
                  line: x.fieldsDeps[field.name][depName],
                  name: x.fileName,
                  path: x.filePath
                }
              ]
            })
          );
          return;
        } else if (
          field.fieldClass === apiToBlockml.FieldClassEnum.Dimension &&
          dependentField.fieldClass === apiToBlockml.FieldClassEnum.Calculation
        ) {
          item.errors.push(
            new BmError({
              title: enums.ErTitleEnum.DIMENSION_REFS_CALCULATION,
              message:
                'Dimensions can not reference calculations. ' +
                `Found dimension "${field.name}" is referencing calculation "${depName}".`,
              lines: [
                {
                  line: x.fieldsDeps[field.name][depName],
                  name: x.fileName,
                  path: x.filePath
                }
              ]
            })
          );
          return;
        } else if (
          field.fieldClass === apiToBlockml.FieldClassEnum.Measure &&
          dependentField.fieldClass === apiToBlockml.FieldClassEnum.Measure
        ) {
          item.errors.push(
            new BmError({
              title: enums.ErTitleEnum.MEASURE_REFS_MEASURE,
              message:
                'Measures can not reference measures. ' +
                `Found measure "${field.name}" is referencing measure "${depName}".`,
              lines: [
                {
                  line: x.fieldsDeps[field.name][depName],
                  name: x.fileName,
                  path: x.filePath
                }
              ]
            })
          );
          return;
        } else if (
          field.fieldClass === apiToBlockml.FieldClassEnum.Measure &&
          dependentField.fieldClass === apiToBlockml.FieldClassEnum.Calculation
        ) {
          item.errors.push(
            new BmError({
              title: enums.ErTitleEnum.MEASURE_REFS_CALCULATION,
              message:
                'Measures can not reference calculations. ' +
                `Found measure "${field.name}" is referencing calculation "${depName}".`,
              lines: [
                {
                  line: x.fieldsDeps[field.name][depName],
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
      newEntities.push(x);
    }
  });

  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(
    cs,
    caller,
    func,
    structId,
    enums.LogTypeEnum.Entities,
    newEntities
  );

  return newEntities;
}
