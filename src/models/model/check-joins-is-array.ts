import { AmError } from '../../barrels/am-error';
import { ErrorsCollector } from '../../barrels/errors-collector';
import { interfaces } from '../../barrels/interfaces';

export function checkJoinsIsArray(item: { models: interfaces.Model[] }) {

  let newModels: interfaces.Model[] = [];

  item.models.forEach(x => {

    if (typeof x.joins === 'undefined' || x.joins === null) {
      // error e10
      ErrorsCollector.addError(new AmError({
        title: `missing "joins:" parameter`,
        message: `model must have "joins:" parameter with element(s) inside`,
        lines: [{
          line: x.model_line_num,
          name: x.file,
          path: x.path,
        }],
      }));
      return; // no need for nextModel check

    } else if (!Array.isArray(x.joins)) {

      // error e11
      ErrorsCollector.addError(new AmError({
        title: `"joins:" must be a List`,
        message: `"joins:" must have element(s) inside like:
- from_view: ...,
- join_view: ...`,
        lines: [{
          line: x.joins_line_num,
          name: x.file,
          path: x.path,
        }],
      }));
      return; // no need for nextModel check
    }
    newModels.push(x);
  });

  return newModels;
}
