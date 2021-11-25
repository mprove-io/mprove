import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToDisk } from '~disk/barrels/api-to-disk';
import { common } from '~disk/barrels/common';
import { interfaces } from '~disk/barrels/interfaces';
import { DeleteBranchService } from './delete-branch.service';

@Controller()
export class DeleteBranchController {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private deleteBranchService: DeleteBranchService
  ) {}

  @Post(apiToDisk.ToDiskRequestInfoNameEnum.ToDiskDeleteBranch)
  async deleteBranch(@Body() body: any) {
    try {
      let payload = await this.deleteBranchService.process(body);

      return common.makeOkResponse({ payload, cs: this.cs, body: body });
    } catch (e) {
      return common.makeErrorResponse({ e, cs: this.cs, body: body });
    }
  }
}
