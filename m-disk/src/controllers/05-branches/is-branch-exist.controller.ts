import { Body, Controller, Post } from '@nestjs/common';
import { api } from '../../barrels/api';
import { ConfigService } from '@nestjs/config';
import { interfaces } from '../../barrels/interfaces';
import { IsBranchExistService } from '../../services/05-branches/is-branch-exist.service';

@Controller()
export class IsBranchExistController {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private isBranchExistService: IsBranchExistService
  ) {}

  @Post(api.ToDiskRequestInfoNameEnum.ToDiskIsBranchExist)
  async isBranchExist(@Body() body) {
    try {
      let payload = await this.isBranchExistService.process(body);

      return api.makeOkResponse({ payload, cs: this.cs, req: body });
    } catch (e) {
      return api.makeErrorResponse({ e, cs: this.cs, req: body });
    }
  }
}
