import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendGenerateUserApiKeyRequest,
  zToBackendGenerateUserApiKeyResponse
} from '#common/zod/to-backend/users/to-backend-generate-user-api-key';

export class ToBackendGenerateUserApiKeyRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGenerateUserApiKeyRequest })
) {}

export class ToBackendGenerateUserApiKeyResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGenerateUserApiKeyResponse })
) {}
