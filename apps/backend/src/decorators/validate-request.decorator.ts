import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ClassType } from 'class-transformer-validator';
import { common } from '~backend/barrels/common';

export const ValidateRequest = createParamDecorator(
  // eslint-disable-next-line @typescript-eslint/ban-types
  <T extends object>(classType: ClassType<T>, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    let reqValid = common.transformValidSync({
      classType: classType,
      object: request.body,
      errorMessage: common.ErEnum.BACKEND_WRONG_REQUEST_PARAMS
    });
    return reqValid;
  }
);
