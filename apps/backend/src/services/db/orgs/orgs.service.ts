import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import retry from 'async-retry';
import { eq } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { OrgTab } from '#backend/drizzle/postgres/schema/_tabs';
import { type OrgEnt, orgsTable } from '#backend/drizzle/postgres/schema/orgs';
import { dbErrorToResult } from '#backend/functions/db-error-to-result/db-error-to-result';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { HashService } from '#backend/services/hash/hash.service';
import { RpcService } from '#backend/services/rpc/rpc.service';
import { TabService } from '#backend/services/tab/tab.service';
import { ServerError } from '#common/classes/server-error/server-error';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import { makeId } from '#common/functions/make-id/make-id';
import type { AddOrgResultError } from '#common/types/backend/function-errors/add-org-result-error';
import type { CheckUserIsOrgOwnerResultError } from '#common/types/backend/function-errors/check-user-is-org-owner-result-error';
import type { GetOrgCheckExistsResultError } from '#common/types/backend/function-errors/get-org-check-exists-result-error';
import type { Org } from '#common/types/backend/parts/org';
import type { OrgsItem } from '#common/types/backend/parts/orgs-item';

@Injectable()
export class OrgsService {
  constructor(
    private tabService: TabService,
    private hashService: HashService,
    private rpcService: RpcService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
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

  async getOrgCheckExists(item: { orgId: string }): Promise<OrgTab> {
    let result: Result.Result<OrgTab, GetOrgCheckExistsResultError> =
      await this.getOrgCheckExistsResult(item);

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let org: OrgTab = result.value;

    return org;
  }

  async getOrgCheckExistsResult(item: {
    orgId: string;
  }): Result.ResultAsync<OrgTab, GetOrgCheckExistsResultError> {
    let { orgId } = item;

    let orgEnt: OrgEnt = await this.db.drizzle.query.orgsTable.findFirst({
      where: eq(orgsTable.orgId, orgId)
    });

    if (isUndefined(orgEnt)) {
      return Result.fail({ code: 'BACKEND_ORG_DOES_NOT_EXIST' });
    }

    return this.tabService.orgEntToTabResult({ orgEnt: orgEnt });
  }

  async checkUserIsOrgOwner(item: {
    userId: string;
    org: OrgTab;
  }): Promise<void> {
    let result: Result.Result<void, CheckUserIsOrgOwnerResultError> =
      this.checkUserIsOrgOwnerResult(item);

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }
  }

  checkUserIsOrgOwnerResult(item: {
    userId: string;
    org: OrgTab;
  }): Result.Result<void, CheckUserIsOrgOwnerResultError> {
    let { org, userId } = item;

    if (org.ownerId !== userId) {
      return Result.fail({ code: 'BACKEND_ONLY_ORG_OWNER_CAN_ACCESS' });
    }

    return Result.succeed();
  }

  async addOrg(item: {
    ownerId: string;
    ownerEmail: string;
    name: string;
    traceId: string;
    orgId?: string;
  }): Promise<OrgTab> {
    let result: Result.Result<OrgTab, AddOrgResultError> =
      await this.addOrgResult(item);

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let org: OrgTab = result.value;

    return org;
  }

  async addOrgResult(item: {
    ownerId: string;
    ownerEmail: string;
    name: string;
    traceId: string;
    orgId?: string;
  }): Result.ResultAsync<OrgTab, AddOrgResultError> {
    let { ownerId, ownerEmail, name, traceId, orgId } = item;

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
        traceId: traceId,
        rpcService: this.rpcService,
        db: this.db,
        cs: this.cs,
        logger: this.logger
      }),
      Result.andThrough(v =>
        v.rpcService.sendToDiskResult({
          request: {
            operation: 'createOrg',
            traceId: v.traceId,
            input: { orgId: v.org.orgId }
          }
        })
      ),
      Result.andThrough(v =>
        dbErrorToResult({
          action: async () => {
            await retry(
              async () =>
                await v.db.drizzle.transaction(
                  async tx =>
                    await v.db.packer.write({
                      tx: tx,
                      insert: { orgs: [v.org] }
                    })
                ),
              getRetryOption(v.cs, v.logger)
            );
          }
        })
      ),
      Result.map((v): OrgTab => v.org)
    );
  }
}
