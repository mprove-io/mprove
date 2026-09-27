import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendGenerateProjectRemoteKeyRequest } from '#common/zod/backend/routes/projects/generate-project-remote-key/generate-project-remote-key-request';
import { zToBackendGenerateProjectRemoteKeyResponse } from '#common/zod/backend/routes/projects/generate-project-remote-key/generate-project-remote-key-response';

export class ToBackendGenerateProjectRemoteKeyRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGenerateProjectRemoteKeyRequest })
) {}

export class ToBackendGenerateProjectRemoteKeyResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGenerateProjectRemoteKeyResponse })
) {}
