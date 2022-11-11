import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToDisk } from '~disk/barrels/api-to-disk';
import { interfaces } from '~disk/barrels/interfaces';
import { makeErrorResponseDisk } from '~disk/functions/make-error-response-disk';
import { makeOkResponseDisk } from '~disk/functions/make-ok-response-disk';
import { RevertRepoToRemoteService } from './revert-repo-to-remote.service';

@Controller()
export class RevertRepoToRemoteController {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private revertRepoToRemoteService: RevertRepoToRemoteService
  ) {}

  @Post(apiToDisk.ToDiskRequestInfoNameEnum.ToDiskRevertRepoToRemote)
  async revertRepoToRemote(@Body() body: any) {
    try {
      let payload = await this.revertRepoToRemoteService.process(body);

      return makeOkResponseDisk({
        payload: payload,
        body: body,
        cs: this.cs
      });
    } catch (e) {
      return makeErrorResponseDisk({
        e: e,
        body: body,
        cs: this.cs
      });
    }
  }
}
