import { interfaces } from '../../barrels/interfaces';

export function findJoinsUsingJoinsDeps(item: interfaces.Vars) {
  let joins: { [s: string]: number } = {};

  [
    ...Object.keys(item.needs_doubles),
    ...Object.keys(item.model.always_join_list)
  ]
    .filter(asName => asName !== item.model.from_as && asName !== 'mf')
    .forEach(asName => {
      joins[asName] = 1;
    });

  let restart: boolean = true;

  while (restart) {
    restart = false;

    Object.keys(joins).forEach(asName => {
      // don't use joins_prepared_deps
      Object.keys(item.model.joins_double_deps_after_singles[asName])
        .filter(depAs => depAs !== item.model.from_as && depAs !== 'mf')
        .forEach(depAs => {
          if (!joins[depAs]) {
            joins[depAs] = 1;
            restart = true;
          }
        });
    });
  }

  joins[item.model.from_as] = 1;

  item.joins = joins;

  return item;
}
