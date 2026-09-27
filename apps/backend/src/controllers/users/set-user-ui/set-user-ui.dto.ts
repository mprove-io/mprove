import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendSetUserUiRequest } from '#common/zod/backend/routes/users/set-user-ui/set-user-ui-request';
import { zToBackendSetUserUiResponse } from '#common/zod/backend/routes/users/set-user-ui/set-user-ui-response';

export class ToBackendSetUserUiRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSetUserUiRequest })
) {}

export class ToBackendSetUserUiResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSetUserUiResponse })
) {}
