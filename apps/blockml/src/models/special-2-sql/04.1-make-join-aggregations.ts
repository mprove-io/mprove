import { common } from '~blockml/barrels/common';

let func = common.FuncEnum.MakeJoinAggregations;

export function makeJoinAggregations(item: {
  joins: common.VarsSql['joins'];
  model: common.FileModel;
  varsSqlSteps: common.FilePartTile['varsSqlSteps'];
}) {
  let { joins, model, varsSqlSteps } = item;

  let varsInput = common.makeCopy<common.VarsSql>({
    joins
  });

  let joinAggregations: common.JoinAggregation[] = [];

  model.joinsSorted
    .filter(
      asName => asName !== model.fromAs && common.isDefined(joins[asName])
    )
    .forEach(asName => {
      let join = model.joins.find(j => j.as === asName);

      let joinAg: common.JoinAggregation = {
        joinAs: join.as,
        isSafeAggregation: true
      };

      if (join.as !== model.fromAs) {
        Object.keys(join.sqlOnDoubleDeps).map(depAs => {
          let depJoin = joinAggregations.find(y => y.joinAs === depAs);

          if (depJoin.isSafeAggregation === false) {
            joinAg.isSafeAggregation = false;
          }
        });
      }

      if (
        join.as !== model.fromAs &&
        (join.relationship === common.JoinRelationshipEnum.OneToMany ||
          join.relationship === common.JoinRelationshipEnum.ManyToMany)
      ) {
        joinAggregations.forEach(a => {
          a.isSafeAggregation = false;
        });
      }

      if (
        join.as !== model.fromAs &&
        (join.relationship === common.JoinRelationshipEnum.ManyToOne ||
          join.relationship === common.JoinRelationshipEnum.ManyToMany)
      ) {
        joinAg.isSafeAggregation = false;
      }

      joinAggregations.push(joinAg);
    });

  let varsOutput: common.VarsSql = { joinAggregations: joinAggregations };

  varsSqlSteps.push({ func, varsInput, varsOutput });

  return varsOutput;
}
