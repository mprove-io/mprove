import { EntityManager } from 'typeorm';
import { entities } from '../../barrels/entities';
import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';
import { getDashboardsRepo } from './get-dashboards-repo';
import { getErrorsRepo } from './get-errors-repo';
import { getMconfigsRepo } from './get-mconfigs-repo';
import { getModelsRepo } from './get-models-repo';
import { getQueriesRepo } from './get-queries-repo';
import { getReposRepo } from './get-repos-repo';

export async function deleteOldStruct(item: {
  repo_id: string;
  old_struct_id: string;
}) {
  let storeErrorsTrans = getErrorsRepo();
  let storeDashboardsTrans = getDashboardsRepo();
  let storeMconfigsTrans = getMconfigsRepo();
  let storeModelsTrans = getModelsRepo();
  let storeReposTrans = getReposRepo();
  let storeQueriesTrans = getQueriesRepo();

  await Promise.all([
    storeErrorsTrans
      .delete({
        struct_id: item.old_struct_id,
        repo_id: item.repo_id
      })
      .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_ERRORS_DELETE)),

    storeDashboardsTrans
      .delete({
        struct_id: item.old_struct_id,
        repo_id: item.repo_id
      })
      .catch(e =>
        helper.reThrow(e, enums.storeErrorsEnum.STORE_DASHBOARDS_DELETE)
      ),

    storeMconfigsTrans
      .delete({
        struct_id: item.old_struct_id,
        repo_id: item.repo_id
      })
      .catch(e =>
        helper.reThrow(e, enums.storeErrorsEnum.STORE_MCONFIGS_DELETE)
      ),

    storeModelsTrans
      .delete({
        struct_id: item.old_struct_id,
        repo_id: item.repo_id
      })
      .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_MODELS_DELETE))
  ]).catch(e => helper.reThrow(e, enums.otherErrorsEnum.PROMISE_ALL));

  let reposWithOldStructId = <entities.RepoEntity[]>await storeReposTrans
    .find({
      struct_id: item.old_struct_id
    })
    .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_REPOS_FIND));

  if (reposWithOldStructId.length === 0) {
    await Promise.all([
      storeQueriesTrans
        .delete({
          struct_id: item.old_struct_id
        })
        .catch(e =>
          helper.reThrow(e, enums.storeErrorsEnum.STORE_QUERIES_DELETE)
        )
    ]).catch(e => helper.reThrow(e, enums.otherErrorsEnum.PROMISE_ALL));
  }
}
