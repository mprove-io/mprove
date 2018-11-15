import { AmError } from '../../barrels/am-error';
import { ErrorsCollector } from '../../barrels/errors-collector';
import { enums } from '../../barrels/enums';
import { interfaces } from '../../barrels/interfaces';

export function checkJoinType(item: { models: interfaces.Model[] }) {
  let newModels: interfaces.Model[] = [];

  item.models.forEach(x => {
    let nextModel: boolean = false;

    x.joins
      .filter(j => j.as !== x.from_as)
      .forEach(join => {
        if (nextModel) {
          return;
        }

        if (typeof join.type === 'undefined' || join.type === null) {
          // set join type implicitly
          join.type = enums.JoinTypeEnum.LeftOuter;
          join.type_line_num = 0;
        } else if (
          [
            enums.JoinTypeEnum.Cross,
            enums.JoinTypeEnum.Full,
            enums.JoinTypeEnum.FullOuter,
            enums.JoinTypeEnum.Inner,
            enums.JoinTypeEnum.Left,
            enums.JoinTypeEnum.LeftOuter,
            enums.JoinTypeEnum.Right,
            enums.JoinTypeEnum.RightOuter
          ].indexOf(join.type) < 0
        ) {
          // error e167
          ErrorsCollector.addError(
            new AmError({
              title: `wrong join type`,
              message: `join 'type' value "${join.type}" is not valid`,
              lines: [
                {
                  line: join.type_line_num,
                  name: x.file,
                  path: x.path
                }
              ]
            })
          );

          nextModel = true;
          return;
        }
      });

    if (nextModel) {
      return;
    }

    newModels.push(x);
  });

  return newModels;
}
