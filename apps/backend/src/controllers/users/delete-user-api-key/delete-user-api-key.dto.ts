import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendDeleteUserApiKeyRequest,
  zToBackendDeleteUserApiKeyResponse
} from '#common/zod/to-backend/users/to-backend-delete-user-api-key';

export class ToBackendDeleteUserApiKeyRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteUserApiKeyRequest })
) {}

export class ToBackendDeleteUserApiKeyResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteUserApiKeyResponse })
) {}
