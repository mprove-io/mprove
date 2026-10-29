import { Result } from '@praha/byethrow';
import type { OrgEnt, OrgTab } from '#backend/drizzle/postgres/tables/orgs';
import { getEntProps } from '#backend/functions/get-ent-props/get-ent-props';
import { makeHash } from '#backend/functions/hash/make-hash/make-hash';
import type { TabService } from '#backend/services/tab/tab.service';
import type { OrgTabToEntError } from '#common/types/backend/function-errors/org-tab-to-ent-error';
import type { OrgLt } from '#common/types/shared/st-lt/orgs/org-lt';
import type { OrgSt } from '#common/types/shared/st-lt/orgs/org-st';

export function orgTabToEnt(item: {
  tab: OrgTab;
  hashSecret?: string;
  tabService: TabService;
  isEncryptDb: boolean;
  isEncryptMetadata: boolean;
}): Result.Result<OrgEnt, OrgTabToEntError> {
  let { tab } = item;

  let orgSt: OrgSt = {
    name: tab.name,
    ownerEmail: tab.ownerEmail
  };

  let orgLt: OrgLt = {};

  return Result.pipe(
    Result.succeed({
      ...item,
      st: orgSt,
      lt: orgLt
    }),
    Result.bind('nameHash', v =>
      makeHash({
        input: v.tab.name,
        hashSecret: v.hashSecret
      })
    ),
    Result.bind('ownerEmailHash', v =>
      makeHash({
        input: v.tab.ownerEmail,
        hashSecret: v.hashSecret
      })
    ),
    Result.map(
      (v): OrgEnt => ({
        orgId: v.tab.orgId,
        ownerId: v.tab.ownerId,
        nameHash: v.nameHash,
        ownerEmailHash: v.ownerEmailHash,
        serverTs: v.tab.serverTs,
        ...getEntProps({
          dataSt: v.st,
          dataLt: v.lt,
          isMetadata: false,
          tabService: v.tabService,
          isEncryptDb: v.isEncryptDb,
          isEncryptMetadata: v.isEncryptMetadata
        })
      })
    )
  );
}
