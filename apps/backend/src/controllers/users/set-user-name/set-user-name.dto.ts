import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendSetUserNameRequest } from '#common/types/backend/routes/users/set-user-name/set-user-name-request';
import { zToBackendSetUserNameResponse } from '#common/types/backend/routes/users/set-user-name/set-user-name-response';

export class ToBackendSetUserNameRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSetUserNameRequest })
) {}

export class ToBackendSetUserNameResponseDto extends createBackendResponseDto({
  schema: zToBackendSetUserNameResponse
}) {}
