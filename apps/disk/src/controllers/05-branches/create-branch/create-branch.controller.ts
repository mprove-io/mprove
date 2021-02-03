import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { api } from '~disk/barrels/api';
import { interfaces } from '~disk/barrels/interfaces';
import { CreateBranchService } from './create-branch.service';

@Controller()
export class CreateBranchController {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private createBranchService: CreateBranchService
  ) {}

  @Post(api.ToDiskRequestInfoNameEnum.ToDiskCreateBranch)
  async createBranch(@Body() body) {
    try {
      let payload = await this.createBranchService.process(body);

      return api.makeOkResponse({ payload, cs: this.cs, req: body });
    } catch (e) {
      return api.makeErrorResponse({ e, cs: this.cs, req: body });
    }
  }
}
