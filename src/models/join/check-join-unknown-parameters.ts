import { AmError } from '../../barrels/am-error';
import { ApRegex } from '../../barrels/am-regex';
import { ErrorsCollector } from '../../barrels/errors-collector';
import { interfaces } from '../../barrels/interfaces';

export function checkJoinUnknownParameters(item: {
  models: interfaces.Model[];
}) {
  item.models.forEach(x => {
    x.joins.forEach(join => {
      Object.keys(join)
        .filter(
          k => !k.match(ApRegex.ENDS_WITH_LINE_NUM()) && ['view'].indexOf(k) < 0
        )
        .forEach(parameter => {
          if (
            parameter === 'hidden' &&
            !join[parameter].toString().match(ApRegex.TRUE_FALSE())
          ) {
            // error e122
            ErrorsCollector.addError(
              new AmError({
                title: `wrong join hidden`,
                message: `parameter "hidden" must be 'true' or 'false' if specified`,
                lines: [
                  {
                    line: (<any>join)[parameter + '_line_num'],
                    name: x.file,
                    path: x.path
                  }
                ]
              })
            );
            delete join[parameter];
            delete (<any>join)[parameter + '_line_num'];
            return;
          }

          switch (true) {
            case join.as === x.from_as: {
              if (
                [
                  'from_view',
                  'hidden',
                  'label',
                  'description',
                  'as',
                  'sql_where' // TODO: check from_view with sql_where
                ].indexOf(parameter) < 0
              ) {
                // error e123
                ErrorsCollector.addError(
                  new AmError({
                    title: `unknown join parameter`,
                    message: `parameter '${parameter}' can not be used inside Join with 'from_view'`,
                    lines: [
                      {
                        line: (<any>join)[parameter + '_line_num'],
                        name: x.file,
                        path: x.path
                      }
                    ]
                  })
                );
                delete (<any>join)[parameter];
                delete (<any>join)[parameter + '_line_num'];
                return;
              }
              break;
            }

            case join.as !== x.from_as: {
              if (
                [
                  'join_view',
                  'hidden',
                  'label',
                  'description',
                  'as',
                  'type',
                  'sql_on',
                  'sql_where'
                ].indexOf(parameter) < 0
              ) {
                // error e124
                ErrorsCollector.addError(
                  new AmError({
                    title: `unknown join parameter`,
                    message: `parameter '${parameter}' can not be used inside Join with 'join_view'`,
                    lines: [
                      {
                        line: (<any>join)[parameter + '_line_num'],
                        name: x.file,
                        path: x.path
                      }
                    ]
                  })
                );
                delete (<any>join)[parameter];
                delete (<any>join)[parameter + '_line_num'];
                return;
                // break;
              }
            }
          }

          if (Array.isArray((<any>join)[parameter])) {
            // error e125
            ErrorsCollector.addError(
              new AmError({
                title: `unexpected List`,
                message: `parameter '${parameter}' must have a single value`,
                lines: [
                  {
                    line: (<any>join)[parameter + '_line_num'],
                    name: x.file,
                    path: x.path
                  }
                ]
              })
            );
            delete (<any>join)[parameter];
            delete (<any>join)[parameter + '_line_num'];
            return;
          }

          if (
            !!(<any>join)[parameter] &&
            (<any>join)[parameter].constructor === Object
          ) {
            // error e126
            ErrorsCollector.addError(
              new AmError({
                title: `unexpected Hash`,
                message: `parameter '${parameter}' must have a single value`,
                lines: [
                  {
                    line: (<any>join)[parameter + '_line_num'],
                    name: x.file,
                    path: x.path
                  }
                ]
              })
            );
            delete (<any>join)[parameter];
            delete (<any>join)[parameter + '_line_num'];
            return;
          }
        });
    });
  });

  return item.models;
}
