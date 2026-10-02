import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendDeleteUserApiKeyRequest } from '#common/types/backend/routes/users/delete-user-api-key/delete-user-api-key-request';
import { zToBackendDeleteUserApiKeyResponse } from '#common/types/backend/routes/users/delete-user-api-key/delete-user-api-key-response';

export class ToBackendDeleteUserApiKeyRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteUserApiKeyRequest })
) {}

export class ToBackendDeleteUserApiKeyResponseDto extends createBackendResponseDto(
  { schema: zToBackendDeleteUserApiKeyResponse }
) {}
