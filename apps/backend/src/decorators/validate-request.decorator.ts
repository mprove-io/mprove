import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ClassType } from 'class-transformer-validator';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';

export const ValidateRequest = createParamDecorator(
  // eslint-disable-next-line @typescript-eslint/ban-types
  <T extends object>(classType: ClassType<T>, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    let reqValid = common.transformValidSync({
      classType: classType,
      object: request.body,
      errorMessage: apiToBackend.ErEnum.BACKEND_WRONG_REQUEST_PARAMS
    });
    return reqValid;
  }
);
