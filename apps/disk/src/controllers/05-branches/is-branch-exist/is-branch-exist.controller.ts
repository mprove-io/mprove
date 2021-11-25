import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToDisk } from '~disk/barrels/api-to-disk';
import { common } from '~disk/barrels/common';
import { interfaces } from '~disk/barrels/interfaces';
import { IsBranchExistService } from './is-branch-exist.service';

@Controller()
export class IsBranchExistController {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private isBranchExistService: IsBranchExistService
  ) {}

  @Post(apiToDisk.ToDiskRequestInfoNameEnum.ToDiskIsBranchExist)
  async isBranchExist(@Body() body: any) {
    try {
      let payload = await this.isBranchExistService.process(body);

      return common.makeOkResponse({ payload, cs: this.cs, body: body });
    } catch (e) {
      return common.makeErrorResponse({ e, cs: this.cs, body: body });
    }
  }
}
