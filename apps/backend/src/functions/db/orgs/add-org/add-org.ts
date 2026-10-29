import { Result } from '@praha/byethrow';
import type { OrgTab } from '#backend/drizzle/postgres/tables/orgs';
import type { DbService } from '#backend/services/db/db.service';
import type { RpcService } from '#backend/services/rpc/rpc.service';
import { makeId } from '#common/functions/make-id/make-id';
import type { AddOrgError } from '#common/types/backend/function-errors/add-org-error';

export async function addOrg(item: {
  ownerId: string;
  ownerEmail: string;
  name: string;
  traceId: string;
  orgId?: string;
  rpcService: RpcService;
  db: DbService;
}): Result.ResultAsync<OrgTab, AddOrgError> {
  let { ownerId, ownerEmail, name, orgId } = item;

  let newOrg: OrgTab = {
    orgId: orgId || makeId(),
    name: name,
    ownerId: ownerId,
    ownerEmail: ownerEmail,
    nameHash: undefined, // tab-to-ent
    ownerEmailHash: undefined, // tab-to-ent
    keyTag: undefined,
    serverTs: undefined
  };

  return Result.pipe(
    Result.succeed({
      org: newOrg,
      traceId: item.traceId,
      rpcService: item.rpcService,
      db: item.db
    }),
    Result.andThrough(v =>
      v.rpcService.sendToDisk({
        request: {
          operation: 'createOrg',
          traceId: v.traceId,
          input: { orgId: v.org.orgId }
        }
      })
    ),
    Result.andThrough(v => v.db.write({ insert: { orgs: [v.org] } })),
    Result.map((v): OrgTab => v.org)
  );
}
