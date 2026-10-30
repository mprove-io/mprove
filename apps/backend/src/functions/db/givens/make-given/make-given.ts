import type { GivenTab } from '#backend/drizzle/postgres/tables/givens';
import { makeGivenFullId } from '#backend/functions/db/givens/make-given-full-id/make-given-full-id';
import type { GivenType } from '#common/types/backend/parts/given/given-type';

export function makeGiven(item: {
  projectId: string;
  givenId: string;
  type: GivenType;
  isMultiple: boolean;
  values: string[];
}): GivenTab {
  let { projectId, givenId, type, isMultiple, values } = item;

  let given: GivenTab = {
    givenFullId: makeGivenFullId({
      projectId: projectId,
      givenId: givenId
    }),
    projectId: projectId,
    givenId: givenId,
    type: type,
    isMultiple: isMultiple,
    values: values,
    keyTag: undefined,
    serverTs: undefined
  };

  return given;
}
