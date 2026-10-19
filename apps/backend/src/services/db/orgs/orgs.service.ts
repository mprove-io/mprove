import { Injectable } from '@nestjs/common';
import { Result } from '@praha/byethrow';
import type { OrgTab } from '#backend/drizzle/postgres/schema/_tabs';
import { DbService } from '#backend/services/db/db.service';
import { RpcService } from '#backend/services/rpc/rpc.service';
import { ServerError } from '#common/classes/server-error/server-error';
import { makeId } from '#common/functions/make-id/make-id';
import type { AddOrgError } from '#common/types/backend/function-errors/add-org-error';
import type { CheckUserIsOrgOwnerError } from '#common/types/backend/function-errors/check-user-is-org-owner-error';
import type { Org } from '#common/types/backend/parts/org';
import type { OrgsItem } from '#common/types/backend/parts/orgs-item';

@Injectable()
export class OrgsService {
  constructor(
    private rpcService: RpcService,
    private db: DbService
  ) {}

  tabToApi(item: { org: OrgTab }): Org {
    let { org } = item;

    let apiOrg: Org = {
      orgId: org.orgId,
      ownerId: org.ownerId,
      name: org.name,
      ownerEmail: org.ownerEmail,
      serverTs: Number(org.serverTs)
    };

    return apiOrg;
  }

  tabToApiOrgsItem(item: { org: OrgTab }): OrgsItem {
    let { org } = item;

    let apiOrgsItem: OrgsItem = {
      orgId: org.orgId,
      name: org.name
    };

    return apiOrgsItem;
  }

  checkUserIsOrgOwner(item: {
    userId: string;
    org: OrgTab;
  }): Result.Result<void, CheckUserIsOrgOwnerError> {
    let { org, userId } = item;

    if (org.ownerId !== userId) {
      return Result.fail({ code: 'BACKEND_ONLY_ORG_OWNER_CAN_ACCESS' });
    }

    return Result.succeed();
  }

  async addOrgUnwrap(item: {
    ownerId: string;
    ownerEmail: string;
    name: string;
    traceId: string;
    orgId?: string;
  }): Promise<OrgTab> {
    let result: Result.Result<OrgTab, AddOrgError> = await this.addOrg(item);

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

  async addOrg(item: {
    ownerId: string;
    ownerEmail: string;
    name: string;
    traceId: string;
    orgId?: string;
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
        traceId: item.traceId
      }),
      Result.andThrough(v =>
        this.rpcService.sendToDisk({
          request: {
            operation: 'createOrg',
            traceId: v.traceId,
            input: { orgId: v.org.orgId }
          }
        })
      ),
      Result.andThrough(v => this.db.write({ insert: { orgs: [v.org] } })),
      Result.map((v): OrgTab => v.org)
    );
  }
}
