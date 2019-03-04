import { AmError } from '../../barrels/am-error';
import { ErrorsCollector } from '../../barrels/errors-collector';
import { interfaces } from '../../barrels/interfaces';

export function makeJoinsAndSetLabelsAndDescriptions(item: {
  models: interfaces.Model[],
  views: interfaces.View[]
}) {

  let newModels: interfaces.Model[] = [];

  item.models.forEach(x => {

    let nextModel: boolean = false;

    x.joins.forEach(j => {

      if (nextModel) { return; }

      let name = j.as === x.from_as
        ? j.from_view
        : j.join_view;

      let view = item.views.find(v => v.name === name);

      if (view) {
        j.view = JSON.parse(JSON.stringify(view));

        j.label = j.label
          ? j.label
          : j.view.label;

        j.label_line_num = j.label_line_num
          ? j.label_line_num
          : 0;

        j.description = j.description
          ? j.description
          : j.view.description;

        j.description_line_num = j.description_line_num
          ? j.description_line_num
          : 0;

      } else {

        let line = j.as === x.from_as
          ? j.from_view_line_num
          : j.join_view_line_num;

        // error e40, e41
        ErrorsCollector.addError(new AmError({
          title: `join calls missing view`,
          message: `view '${name}' is missing or not valid`,
          lines: [{
            line: line,
            name: x.file,
            path: x.path,
          }]
        }));
        nextModel = true;
        return;
      }
    });

    if (nextModel) { return; }

    newModels.push(x);
  });

  return newModels;
}
