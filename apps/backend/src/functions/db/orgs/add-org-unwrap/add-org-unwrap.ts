import { Result } from '@praha/byethrow';
import type { OrgTab } from '#backend/drizzle/postgres/tables/orgs';
import { addOrg } from '#backend/functions/db/orgs/add-org/add-org';
import type { DbService } from '#backend/services/db/db.service';
import type { RpcService } from '#backend/services/rpc/rpc.service';
import { ServerError } from '#common/classes/server-error/server-error';
import type { AddOrgError } from '#common/types/backend/function-errors/add-org-error';

export async function addOrgUnwrap(item: {
  ownerId: string;
  ownerEmail: string;
  name: string;
  traceId: string;
  orgId?: string;
  rpcService: RpcService;
  db: DbService;
}): Promise<OrgTab> {
  let { rpcService, db } = item;

  let result: Result.Result<OrgTab, AddOrgError> = await addOrg({
    ownerId: item.ownerId,
    ownerEmail: item.ownerEmail,
    name: item.name,
    traceId: item.traceId,
    orgId: item.orgId,
    rpcService: rpcService,
    db: db
  });

  if (Result.isFailure(result)) {
    throw new ServerError({
      message: result.error.code,
      displayData:
        'displayData' in result.error ? result.error.displayData : undefined,
      customData:
        'customData' in result.error ? result.error.customData : undefined,
      originalError:
        'originalError' in result.error && result.error.originalError
          ? Object.assign(new Error(result.error.originalError.code), {
              displayData:
                'displayData' in result.error.originalError
                  ? result.error.originalError.displayData
                  : undefined
            })
          : undefined
    });
  }

  let org: OrgTab = result.value;

  return org;
}
