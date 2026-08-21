import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendSetProjectSandboxProviderRequest,
  zToBackendSetProjectSandboxProviderResponse
} from '#common/zod/to-backend/projects/to-backend-set-project-sandbox-provider';

export class ToBackendSetProjectSandboxProviderRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSetProjectSandboxProviderRequest })
) {}

export class ToBackendSetProjectSandboxProviderResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSetProjectSandboxProviderResponse })
) {}
