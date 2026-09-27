import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendSetProjectSandboxProviderRequest } from '#common/zod/backend/routes/projects/set-project-sandbox-provider/set-project-sandbox-provider-request';
import { zToBackendSetProjectSandboxProviderResponse } from '#common/zod/backend/routes/projects/set-project-sandbox-provider/set-project-sandbox-provider-response';

export class ToBackendSetProjectSandboxProviderRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSetProjectSandboxProviderRequest })
) {}

export class ToBackendSetProjectSandboxProviderResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSetProjectSandboxProviderResponse })
) {}
