import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendDeleteUserApiKeyRequest } from '#common/zod/backend/routes/users/delete-user-api-key/delete-user-api-key-request';
import { zToBackendDeleteUserApiKeyResponse } from '#common/zod/backend/routes/users/delete-user-api-key/delete-user-api-key-response';

export class ToBackendDeleteUserApiKeyRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteUserApiKeyRequest })
) {}

export class ToBackendDeleteUserApiKeyResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteUserApiKeyResponse })
) {}
