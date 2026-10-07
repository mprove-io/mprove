import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendGenerateProjectRemoteKeyRequest } from '#common/types/backend/routes/projects/generate-project-remote-key/generate-project-remote-key-request';
import { zToBackendGenerateProjectRemoteKeyResponse } from '#common/types/backend/routes/projects/generate-project-remote-key/generate-project-remote-key-response';

export class ToBackendGenerateProjectRemoteKeyRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGenerateProjectRemoteKeyRequest })
) {}

export class ToBackendGenerateProjectRemoteKeyResponseDto extends createBackendResponseDto(
  { schema: zToBackendGenerateProjectRemoteKeyResponse }
) {}
