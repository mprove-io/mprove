import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendSetProjectSandboxProviderRequest } from '#common/types/backend/routes/projects/set-project-sandbox-provider/set-project-sandbox-provider-request';
import { zToBackendSetProjectSandboxProviderResponse } from '#common/types/backend/routes/projects/set-project-sandbox-provider/set-project-sandbox-provider-response';

export class ToBackendSetProjectSandboxProviderRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSetProjectSandboxProviderRequest })
) {}

export class ToBackendSetProjectSandboxProviderResponseDto extends createBackendResponseDto(
  { schema: zToBackendSetProjectSandboxProviderResponse }
) {}
