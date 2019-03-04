import { AmError } from '../../barrels/am-error';
import { ErrorsCollector } from '../../barrels/errors-collector';
import { interfaces } from '../../barrels/interfaces';

export function checkModelAccessUsers(item: { models: interfaces.Model[] }) {
  let newModels: interfaces.Model[] = [];

  item.models.forEach(x => {
    if (typeof x.access_users !== 'undefined' && x.access_users !== null) {
      if (!Array.isArray(x.access_users)) {
        // error e258
        ErrorsCollector.addError(
          new AmError({
            title: `access_users must be an Array`,
            message: `access_users" must have element(s) inside like:
- 'user_alias_name'
- 'user_alias_name'`,
            lines: [
              {
                line: x.access_users_line_num,
                name: x.file,
                path: x.path
              }
            ]
          })
        );
        return;
      }

      x.access_users.forEach(u => {
        if (typeof u !== 'string' && !(<any>u instanceof String)) {
          // error e259
          ErrorsCollector.addError(
            new AmError({
              title: `wrong access_users element`,
              message: `found array element that is not a single value`,
              lines: [
                {
                  line: x.access_users_line_num,
                  name: x.file,
                  path: x.path
                }
              ]
            })
          );
          return;
        }
      });
    }
    newModels.push(x);
  });

  return newModels;
}
