import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ErEnum } from '~common/enums/er.enum';
import { isUndefined } from '~common/functions/is-undefined';
import { ServerError } from '~common/models/server-error';

@Injectable()
export class ThrottlerUserIdGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    if (isUndefined(req.user?.userId)) {
      throw new ServerError({
        message: ErEnum.BACKEND_THROTTLER_USER_ID_IS_NOT_DEFINED
      });
    }

    return req.user.userId;

    // return req.ips.length ? req.ips[0] : req.ip;
  }
}
