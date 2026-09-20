import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { ToDiskResponseResultForOperation } from '#common/zod/disk/response/to-disk-response-result-for-operation';
import type { ToDiskDeleteOrgOutput } from '#common/zod/disk/routes/orgs/delete-org/delete-org-response';
import type { DiskConfig } from '#disk/config/disk-config';
import { isPathExist } from '#disk/functions/disk/is-path-exist/is-path-exist';
import { removePath } from '#disk/functions/disk/remove-path/remove-path';

@Injectable()
export class DeleteOrgService {
  constructor(private cs: ConfigService<DiskConfig>) {}

  async process(item: {
    orgId: string;
  }): Promise<ToDiskResponseResultForOperation<'deleteOrg'>> {
    let { orgId } = item;

    let orgPath: string = this.cs.get<DiskConfig['diskOrganizationsPath']>(
      'diskOrganizationsPath'
    );

    let deleteOrgResult = Result.pipe(
      Result.succeed({
        orgId: orgId,
        orgDir: `${orgPath}/${orgId}`
      }),
      Result.bind('isOrgExist', item => isPathExist({ path: item.orgDir })),
      Result.andThrough(item =>
        item.isOrgExist === true
          ? removePath({ path: item.orgDir })
          : Result.succeed()
      ),
      Result.map(
        (item): ToDiskDeleteOrgOutput => ({
          deletedOrgId: item.orgId
        })
      )
    );

    return deleteOrgResult;
  }
}
