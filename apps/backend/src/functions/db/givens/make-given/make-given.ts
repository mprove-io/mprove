import type { GivenTab } from '#backend/drizzle/postgres/schema/_tabs';
import type { HashService } from '#backend/services/hash/hash.service';
import type { GivenType } from '#common/types/backend/parts/given/given-type';

export function makeGiven(item: {
  hashService: HashService;
  projectId: string;
  givenId: string;
  type: GivenType;
  isMultiple: boolean;
  values: string[];
}): GivenTab {
  let { hashService, projectId, givenId, type, isMultiple, values } = item;

  let given: GivenTab = {
    givenFullId: hashService.makeGivenFullId({
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
