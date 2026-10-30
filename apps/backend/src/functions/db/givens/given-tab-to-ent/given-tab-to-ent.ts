import { Result } from '@praha/byethrow';
import type {
  GivenEnt,
  GivenTab
} from '#backend/drizzle/postgres/tables/givens';
import { makeGivenFullId } from '#backend/functions/db/givens/make-given-full-id/make-given-full-id';
import { getEntProps } from '#backend/functions/get-ent-props/get-ent-props';
import type { TabService } from '#backend/services/tab/tab.service';
import type { GivenLt } from '#common/types/shared/st-lt/givens/given-lt';
import type { GivenSt } from '#common/types/shared/st-lt/givens/given-st';

export function givenTabToEnt(item: {
  tab: GivenTab;
  tabService: TabService;
  isEncryptDb: boolean;
  isEncryptMetadata: boolean;
}): Result.Result<GivenEnt, never> {
  let { tab, tabService, isEncryptDb, isEncryptMetadata } = item;

  let givenSt: GivenSt = { values: tab.values };

  let givenLt: GivenLt = {};

  let givenEnt: GivenEnt = {
    givenFullId: makeGivenFullId({
      projectId: tab.projectId,
      givenId: tab.givenId
    }),
    projectId: tab.projectId,
    givenId: tab.givenId,
    type: tab.type,
    isMultiple: tab.isMultiple,
    serverTs: tab.serverTs,
    ...getEntProps({
      dataSt: givenSt,
      dataLt: givenLt,
      isMetadata: false,
      tabService: tabService,
      isEncryptDb: isEncryptDb,
      isEncryptMetadata: isEncryptMetadata
    })
  };

  return Result.succeed(givenEnt);
}
