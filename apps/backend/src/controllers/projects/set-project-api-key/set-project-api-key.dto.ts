import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendSetProjectApiKeyRequest,
  zToBackendSetProjectApiKeyResponse
} from '#common/zod/to-backend/projects/to-backend-set-project-api-key';

export class ToBackendSetProjectApiKeyRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSetProjectApiKeyRequest })
) {}

export class ToBackendSetProjectApiKeyResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSetProjectApiKeyResponse })
) {}
