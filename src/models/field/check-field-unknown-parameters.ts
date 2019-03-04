import { AmError } from '../../barrels/am-error';
import { ApRegex } from '../../barrels/am-regex';
import { ErrorsCollector } from '../../barrels/errors-collector';
import { enums } from '../../barrels/enums';
import { interfaces } from '../../barrels/interfaces';

export function checkFieldUnknownParameters<
  T extends interfaces.View | interfaces.Model | interfaces.Dashboard
>(item: { entities: Array<T> }) {
  item.entities.forEach(x => {
    x.fields.forEach(field => {
      // must be explicit

      Object.keys(field)
        .filter(
          k =>
            !k.match(ApRegex.ENDS_WITH_LINE_NUM()) &&
            ['name', 'field_class'].indexOf(k) < 0
        )
        .forEach(parameter => {
          if (
            parameter === 'hidden' &&
            !field[parameter].match(ApRegex.TRUE_FALSE())
          ) {
            // error e115
            ErrorsCollector.addError(
              new AmError({
                title: `wrong field hidden`,
                message: `parameter "hidden" must be 'true' or 'false' if specified`,
                lines: [
                  {
                    line: (<any>field)[parameter + '_line_num'],
                    name: x.file,
                    path: x.path
                  }
                ]
              })
            );
            delete field[parameter];
            delete (<any>field)[parameter + '_line_num'];
            return;
          }

          switch (field.field_class) {
            case enums.FieldClassEnum.Dimension: {
              if (
                [
                  'dimension',
                  'hidden',
                  'label',
                  'description',
                  'unnest',
                  'type',
                  'sql',
                  'result',
                  'format_number',
                  'currency_prefix',
                  'currency_suffix'
                ].indexOf(parameter) < 0
              ) {
                // error e109
                ErrorsCollector.addError(
                  new AmError({
                    title: `unknown dimension parameter`,
                    message: `parameter "${parameter}" can not be used with 'dimension' field`,
                    lines: [
                      {
                        line: (<any>field)[parameter + '_line_num'],
                        name: x.file,
                        path: x.path
                      }
                    ]
                  })
                );
                delete (<any>field)[parameter];
                delete (<any>field)[parameter + '_line_num'];
                return;
              }
              break;
            }

            case enums.FieldClassEnum.Time: {
              if (
                [
                  'time',
                  'hidden',
                  'group_label',
                  'group_description',
                  'unnest_on',
                  'source',
                  'sql',
                  'timeframes'
                ].indexOf(parameter) < 0
              ) {
                // error e110
                ErrorsCollector.addError(
                  new AmError({
                    title: `unknown time parameter`,
                    message: `parameter "${parameter}" can not be used with 'time' field`,
                    lines: [
                      {
                        line: (<any>field)[parameter + '_line_num'],
                        name: x.file,
                        path: x.path
                      }
                    ]
                  })
                );
                delete (<any>field)[parameter];
                delete (<any>field)[parameter + '_line_num'];
                return;
              }
              break;
            }

            case enums.FieldClassEnum.Measure: {
              if (
                [
                  'measure',
                  'hidden',
                  'label',
                  'description',
                  'type',
                  'result',
                  'sql',
                  'sql_key',
                  'percentile',
                  'format_number',
                  'currency_prefix',
                  'currency_suffix'
                ].indexOf(parameter) < 0
              ) {
                // error e111
                ErrorsCollector.addError(
                  new AmError({
                    title: `unknown measure parameter`,
                    message: `parameter "${parameter}" can not be used with 'measure' field`,
                    lines: [
                      {
                        line: (<any>field)[parameter + '_line_num'],
                        name: x.file,
                        path: x.path
                      }
                    ]
                  })
                );
                delete (<any>field)[parameter];
                delete (<any>field)[parameter + '_line_num'];
                return;
              }
              break;
            }

            case enums.FieldClassEnum.Calculation: {
              if (
                [
                  'calculation',
                  'hidden',
                  'label',
                  'description',
                  'sql',
                  'result',
                  'format_number',
                  'currency_prefix',
                  'currency_suffix'
                ].indexOf(parameter) < 0
              ) {
                // error e112
                ErrorsCollector.addError(
                  new AmError({
                    title: `unknown calculation parameter`,
                    message: `parameter "${parameter}" can not be used with 'calculation' field`,
                    lines: [
                      {
                        line: (<any>field)[parameter + '_line_num'],
                        name: x.file,
                        path: x.path
                      }
                    ]
                  })
                );
                delete (<any>field)[parameter];
                delete (<any>field)[parameter + '_line_num'];
                return;
              }
              break;
            }

            case enums.FieldClassEnum.Filter: {
              if (
                [
                  'filter',
                  'hidden',
                  'label',
                  'description',
                  'result',
                  'default',
                  'from_field',
                  'sql' // checked before, just for deps logic
                ].indexOf(parameter) < 0
              ) {
                // error e219
                ErrorsCollector.addError(
                  new AmError({
                    title: `unknown filter parameter`,
                    message: `parameter "${parameter}" can not be used with 'filter' field`,
                    lines: [
                      {
                        line: (<any>field)[parameter + '_line_num'],
                        name: x.file,
                        path: x.path
                      }
                    ]
                  })
                );
                delete (<any>field)[parameter];
                delete (<any>field)[parameter + '_line_num'];
                return;
              }
              break;
            }
          }

          if (
            Array.isArray((<any>field)[parameter]) &&
            ['timeframes', 'default'].indexOf(parameter) < 0
          ) {
            // error e113
            ErrorsCollector.addError(
              new AmError({
                title: `unexpected List`,
                message: `parameter "${parameter}" must have a single value`,
                lines: [
                  {
                    line: (<any>field)[parameter + '_line_num'],
                    name: x.file,
                    path: x.path
                  }
                ]
              })
            );
            delete (<any>field)[parameter];
            delete (<any>field)[parameter + '_line_num'];
            return;
          } else if (
            !!(<any>field)[parameter] &&
            (<any>field)[parameter].constructor === Object
          ) {
            // error e114
            ErrorsCollector.addError(
              new AmError({
                title: `unexpected Hash`,
                message: `parameter "${parameter}" must have a single value`,
                lines: [
                  {
                    line: (<any>field)[parameter + '_line_num'],
                    name: x.file,
                    path: x.path
                  }
                ]
              })
            );
            delete (<any>field)[parameter];
            delete (<any>field)[parameter + '_line_num'];
            return;
          }
        });
    });
  });

  return item.entities;
}
