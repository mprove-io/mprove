import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendSetUserUiRequest } from '#common/types/backend/routes/users/set-user-ui/set-user-ui-request';
import { zToBackendSetUserUiResponse } from '#common/types/backend/routes/users/set-user-ui/set-user-ui-response';

export class ToBackendSetUserUiRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSetUserUiRequest })
) {}

export class ToBackendSetUserUiResponseDto extends createBackendResponseDto({
  schema: zToBackendSetUserUiResponse
}) {}
