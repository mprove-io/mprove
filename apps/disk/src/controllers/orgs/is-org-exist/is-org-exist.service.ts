import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { ToDiskIsOrgExistOutput } from '#common/types/disk/routes/orgs/is-org-exist/is-org-exist-output';
import type { DiskConfig } from '#disk/config/disk-config';
import { isPathExist } from '#disk/functions/disk/is-path-exist/is-path-exist';
import type { DiskResultForOperation } from '#disk/types/disk-result-for-operation';

@Injectable()
export class IsOrgExistService {
  constructor(private cs: ConfigService<DiskConfig>) {}

  async process(item: {
    orgId: string;
  }): Promise<DiskResultForOperation<'isOrgExist'>> {
    let orgPath: string = this.cs.get<DiskConfig['diskOrganizationsPath']>(
      'diskOrganizationsPath'
    );

    let isOrgExistResult = Result.pipe(
      Result.succeed({
        ...item,
        orgDir: `${orgPath}/${item.orgId}`
      }),
      Result.bind(
        'isOrgExist',
        (v): Result.ResultAsync<boolean, never> =>
          isPathExist({ path: v.orgDir })
      ),
      Result.map(
        (v): ToDiskIsOrgExistOutput => ({
          orgId: v.orgId,
          isOrgExist: v.isOrgExist
        })
      )
    );

    return isOrgExistResult;
  }
}
