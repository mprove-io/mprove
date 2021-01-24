import { Body, Controller, Post } from '@nestjs/common';
import { api } from '../../barrels/api';
import { ConfigService } from '@nestjs/config';
import { interfaces } from '../../barrels/interfaces';
import { DeleteBranchService } from '../../services/05-branches/delete-branch.service';

@Controller()
export class DeleteBranchController {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private deleteBranchService: DeleteBranchService
  ) {}

  @Post(api.ToDiskRequestInfoNameEnum.ToDiskDeleteBranch)
  async deleteBranch(@Body() body) {
    try {
      let payload = await this.deleteBranchService.process(body);

      return api.makeOkResponse({ payload, cs: this.cs, req: body });
    } catch (e) {
      return api.makeErrorResponse({ e, cs: this.cs, req: body });
    }
  }
}
