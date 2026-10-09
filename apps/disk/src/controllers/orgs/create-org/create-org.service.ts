import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { ToDiskCreateOrgOutput } from '#common/types/disk/routes/orgs/create-org/create-org-output';
import type { DiskConfig } from '#disk/config/disk-config';
import { ensureDir } from '#disk/functions/disk/ensure-dir/ensure-dir';
import type { DiskResultForOperation } from '#disk/types/disk-result-for-operation';
import { checkOrgDoesNotExist } from './check-org-does-not-exist/check-org-does-not-exist';

@Injectable()
export class CreateOrgService {
  constructor(private cs: ConfigService<DiskConfig>) {}

  async process(item: {
    orgId: string;
  }): Promise<DiskResultForOperation<'createOrg'>> {
    let orgPath: string = this.cs.get<DiskConfig['diskOrganizationsPath']>(
      'diskOrganizationsPath'
    );

    let createOrgResult = Result.pipe(
      Result.succeed({
        ...item,
        orgDir: `${orgPath}/${item.orgId}`
      }),
      Result.andThrough(v => checkOrgDoesNotExist({ orgDir: v.orgDir })),
      Result.andThrough(v => ensureDir({ dir: v.orgDir })),
      Result.map((v): ToDiskCreateOrgOutput => ({ orgId: v.orgId }))
    );

    return createOrgResult;
  }
}
