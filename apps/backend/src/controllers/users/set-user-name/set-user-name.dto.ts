import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendSetUserNameRequest } from '#common/zod/backend/routes/users/set-user-name/set-user-name-request';
import { zToBackendSetUserNameResponse } from '#common/zod/backend/routes/users/set-user-name/set-user-name-response';

export class ToBackendSetUserNameRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSetUserNameRequest })
) {}

export class ToBackendSetUserNameResponseDto extends createBackendResponseDto({
  schema: zToBackendSetUserNameResponse
}) {}
