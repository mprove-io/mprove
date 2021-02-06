import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToDisk } from '~disk/barrels/api-to-disk';
import { common } from '~disk/barrels/common';
import { interfaces } from '~disk/barrels/interfaces';
import { CreateBranchService } from './create-branch.service';

@Controller()
export class CreateBranchController {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private createBranchService: CreateBranchService
  ) {}

  @Post(apiToDisk.ToDiskRequestInfoNameEnum.ToDiskCreateBranch)
  async createBranch(@Body() body) {
    try {
      let payload = await this.createBranchService.process(body);

      return common.makeOkResponse({ payload, cs: this.cs, req: body });
    } catch (e) {
      return common.makeErrorResponse({ e, cs: this.cs, req: body });
    }
  }
}
