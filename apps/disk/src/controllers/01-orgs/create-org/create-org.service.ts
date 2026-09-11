import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { ToDiskCreateOrgOutput } from '#common/zod/to-disk/01-orgs/create-org/create-org-response';
import type { ToDiskResultFor } from '#common/zod/to-disk/to-disk-operation-contract';
import type { DiskConfig } from '#disk/config/disk-config';
import { ensureDir } from '#disk/functions/disk/ensure-dir';
import { checkOrgDoesNotExist } from './check-org-does-not-exist';

@Injectable()
export class CreateOrgService {
  constructor(private cs: ConfigService<DiskConfig>) {}

  async process(item: {
    orgId: string;
  }): Promise<ToDiskResultFor<'ToDiskCreateOrg'>> {
    let { orgId } = item;

    let orgPath: string = this.cs.get<DiskConfig['diskOrganizationsPath']>(
      'diskOrganizationsPath'
    );

    let createOrgResult = Result.pipe(
      Result.succeed({
        orgId: orgId,
        orgDir: `${orgPath}/${orgId}`
      }),
      Result.andThrough(item => checkOrgDoesNotExist({ orgDir: item.orgDir })),
      Result.andThrough(item => ensureDir({ dir: item.orgDir })),
      Result.map((item): ToDiskCreateOrgOutput => ({ orgId: item.orgId }))
    );

    return createOrgResult;
  }
}
