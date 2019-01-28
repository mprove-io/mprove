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
  let storeErrors = getErrorsRepo();
  let storeDashboards = getDashboardsRepo();
  let storeMconfigs = getMconfigsRepo();
  let storeModels = getModelsRepo();
  let storeRepos = getReposRepo();
  let storeQueries = getQueriesRepo();

  await Promise.all([
    storeErrors
      .delete({
        struct_id: item.old_struct_id,
        repo_id: item.repo_id
      })
      .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_ERRORS_DELETE)),

    storeDashboards
      .delete({
        struct_id: item.old_struct_id,
        repo_id: item.repo_id
      })
      .catch(e =>
        helper.reThrow(e, enums.storeErrorsEnum.STORE_DASHBOARDS_DELETE)
      ),

    storeMconfigs
      .delete({
        struct_id: item.old_struct_id,
        repo_id: item.repo_id
      })
      .catch(e =>
        helper.reThrow(e, enums.storeErrorsEnum.STORE_MCONFIGS_DELETE)
      ),

    storeModels
      .delete({
        struct_id: item.old_struct_id,
        repo_id: item.repo_id
      })
      .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_MODELS_DELETE))
  ]).catch(e => helper.reThrow(e, enums.otherErrorsEnum.PROMISE_ALL));

  let reposWithOldStructId = <entities.RepoEntity[]>await storeRepos
    .find({
      struct_id: item.old_struct_id
    })
    .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_REPOS_FIND));

  if (reposWithOldStructId.length === 0) {
    await Promise.all([
      storeQueries
        .delete({
          struct_id: item.old_struct_id
        })
        .catch(e =>
          helper.reThrow(e, enums.storeErrorsEnum.STORE_QUERIES_DELETE)
        )
    ]).catch(e => helper.reThrow(e, enums.otherErrorsEnum.PROMISE_ALL));
  }
}
