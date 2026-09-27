import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendGenerateUserApiKeyRequest } from '#common/zod/backend/routes/users/generate-user-api-key/generate-user-api-key-request';
import { zToBackendGenerateUserApiKeyResponse } from '#common/zod/backend/routes/users/generate-user-api-key/generate-user-api-key-response';

export class ToBackendGenerateUserApiKeyRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGenerateUserApiKeyRequest })
) {}

export class ToBackendGenerateUserApiKeyResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGenerateUserApiKeyResponse })
) {}
