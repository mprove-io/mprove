import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { ToDiskDeleteOrgOutput } from '#common/zod/disk/routes/orgs/delete-org/delete-org-output';
import type { DiskConfig } from '#disk/config/disk-config';
import { isPathExist } from '#disk/functions/disk/is-path-exist/is-path-exist';
import { removePath } from '#disk/functions/disk/remove-path/remove-path';
import type { DiskResultForOperation } from '#disk/types/disk-result-for-operation';

@Injectable()
export class DeleteOrgService {
  constructor(private cs: ConfigService<DiskConfig>) {}

  async process(item: {
    orgId: string;
  }): Promise<DiskResultForOperation<'deleteOrg'>> {
    let { orgId } = item;

    let orgPath: string = this.cs.get<DiskConfig['diskOrganizationsPath']>(
      'diskOrganizationsPath'
    );

    let deleteOrgResult = Result.pipe(
      Result.succeed({
        orgId: orgId,
        orgDir: `${orgPath}/${orgId}`
      }),
      Result.bind(
        'isOrgExist',
        (v): Result.ResultAsync<boolean, never> =>
          isPathExist({ path: v.orgDir })
      ),
      Result.andThrough(v =>
        v.isOrgExist === true
          ? removePath({ path: v.orgDir })
          : Result.succeed()
      ),
      Result.map(
        (v): ToDiskDeleteOrgOutput => ({
          deletedOrgId: v.orgId
        })
      )
    );

    return deleteOrgResult;
  }
}
