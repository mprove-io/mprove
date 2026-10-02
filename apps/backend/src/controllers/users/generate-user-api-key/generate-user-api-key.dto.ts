import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendGenerateUserApiKeyRequest } from '#common/types/backend/routes/users/generate-user-api-key/generate-user-api-key-request';
import { zToBackendGenerateUserApiKeyResponse } from '#common/types/backend/routes/users/generate-user-api-key/generate-user-api-key-response';

export class ToBackendGenerateUserApiKeyRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGenerateUserApiKeyRequest })
) {}

export class ToBackendGenerateUserApiKeyResponseDto extends createBackendResponseDto(
  { schema: zToBackendGenerateUserApiKeyResponse }
) {}
