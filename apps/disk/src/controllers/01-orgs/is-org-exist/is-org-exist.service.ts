import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { ToDiskIsOrgExistOutput } from '#common/zod/to-disk/01-orgs/is-org-exist/is-org-exist-response';
import type { ToDiskResponseResultForOperation } from '#common/zod/to-disk/to-disk-response-result-for-operation';
import type { DiskConfig } from '#disk/config/disk-config';
import { isPathExist } from '#disk/functions/disk/is-path-exist';

@Injectable()
export class IsOrgExistService {
  constructor(private cs: ConfigService<DiskConfig>) {}

  async process(item: {
    orgId: string;
  }): Promise<ToDiskResponseResultForOperation<'isOrgExist'>> {
    let { orgId } = item;

    let orgPath: string = this.cs.get<DiskConfig['diskOrganizationsPath']>(
      'diskOrganizationsPath'
    );

    let isOrgExistResult = Result.pipe(
      Result.succeed({
        orgId: orgId,
        orgDir: `${orgPath}/${orgId}`
      }),
      Result.bind('isOrgExist', item => isPathExist({ path: item.orgDir })),
      Result.map(
        (item): ToDiskIsOrgExistOutput => ({
          orgId: item.orgId,
          isOrgExist: item.isOrgExist
        })
      )
    );

    return isOrgExistResult;
  }
}
