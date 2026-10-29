import type { GivenTab } from '#backend/drizzle/postgres/tables/givens';
import type { Given } from '#common/types/backend/parts/given/given';

export function givenTabToApi(item: { given: GivenTab }): Given {
  let { given } = item;

  let apiGiven: Given = {
    projectId: given.projectId,
    givenId: given.givenId,
    type: given.type,
    isMultiple: given.isMultiple === true,
    values: given.values
  };

  return apiGiven;
}
