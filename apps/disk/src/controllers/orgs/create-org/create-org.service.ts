import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { ToDiskResponseResultForOperation } from '#common/zod/disk/response/to-disk-response-result-for-operation';
import type { ToDiskCreateOrgOutput } from '#common/zod/disk/routes/orgs/create-org/create-org-response';
import type { DiskConfig } from '#disk/config/disk-config';
import { ensureDir } from '#disk/functions/disk/ensure-dir/ensure-dir';
import { checkOrgDoesNotExist } from './check-org-does-not-exist/check-org-does-not-exist';

@Injectable()
export class CreateOrgService {
  constructor(private cs: ConfigService<DiskConfig>) {}

  async process(item: {
    orgId: string;
  }): Promise<ToDiskResponseResultForOperation<'createOrg'>> {
    let { orgId } = item;

    let orgPath: string = this.cs.get<DiskConfig['diskOrganizationsPath']>(
      'diskOrganizationsPath'
    );

    let createOrgResult = Result.pipe(
      Result.succeed({
        orgId: orgId,
        orgDir: `${orgPath}/${orgId}`
      }),
      Result.andThrough(v => checkOrgDoesNotExist({ orgDir: v.orgDir })),
      Result.andThrough(v => ensureDir({ dir: v.orgDir })),
      Result.map((v): ToDiskCreateOrgOutput => ({ orgId: v.orgId }))
    );

    return createOrgResult;
  }
}
