import { ConfigService } from '@nestjs/config';
import { barSpecial } from '~blockml/barrels/bar-special';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.CheckStoreShowIfRefs;

export function checkStoreShowIfRefs(
  item: {
    stores: common.FileStore[];
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Input, item);

  let newStores: common.FileStore[] = [];

  item.stores.forEach(x => {
    let errorsOnStart = item.errors.length;

    if (errorsOnStart === item.errors.length) {
      x.fields
        .filter(y => y.fieldClass === common.FieldClassEnum.Filter)
        .forEach(fieldFilter => {
          barSpecial.checkStoreShowIf(
            {
              showIfParentEntities: fieldFilter.fraction_controls,
              filters: x.fields.filter(
                f => f.fieldClass === common.FieldClassEnum.Filter
              ),
              fileName: x.fileName,
              filePath: x.filePath,
              structId: item.structId,
              errors: item.errors,
              caller: item.caller
            },
            cs
          );
        });
    }

    x.results.forEach(result => {
      result.fraction_types.forEach(fractionTypesElement => {
        if (errorsOnStart === item.errors.length) {
          barSpecial.checkStoreShowIf(
            {
              showIfParentEntities: fractionTypesElement.controls,
              filters: x.fields.filter(
                field => field.fieldClass === common.FieldClassEnum.Filter
              ),
              fileName: x.fileName,
              filePath: x.filePath,
              structId: item.structId,
              errors: item.errors,
              caller: item.caller
            },
            cs
          );
        }
      });
    });

    if (errorsOnStart === item.errors.length) {
      barSpecial.checkStoreShowIf(
        {
          showIfParentEntities: x.field_groups,
          filters: x.fields.filter(
            field => field.fieldClass === common.FieldClassEnum.Filter
          ),
          fileName: x.fileName,
          filePath: x.filePath,
          structId: item.structId,
          errors: item.errors,
          caller: item.caller
        },
        cs
      );
    }

    if (errorsOnStart === item.errors.length) {
      barSpecial.checkStoreShowIf(
        {
          showIfParentEntities: x.fields,
          filters: x.fields.filter(
            field => field.fieldClass === common.FieldClassEnum.Filter
          ),
          fileName: x.fileName,
          filePath: x.filePath,
          structId: item.structId,
          errors: item.errors,
          caller: item.caller
        },
        cs
      );
    }

    if (errorsOnStart === item.errors.length) {
      newStores.push(x);
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
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Stores, newStores);

  return newStores;
}
