import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendGenerateProjectRemoteKeyRequest,
  zToBackendGenerateProjectRemoteKeyResponse
} from '#common/zod/to-backend/projects/to-backend-generate-project-remote-key';

export class ToBackendGenerateProjectRemoteKeyRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGenerateProjectRemoteKeyRequest })
) {}

export class ToBackendGenerateProjectRemoteKeyResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGenerateProjectRemoteKeyResponse })
) {}
