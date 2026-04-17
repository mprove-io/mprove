import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendCreateExplorerSessionRequest,
  zToBackendCreateExplorerSessionResponse
} from '#common/zod/to-backend/sessions/to-backend-create-explorer-session';

export class ToBackendCreateExplorerSessionRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateExplorerSessionRequest })
) {}

export class ToBackendCreateExplorerSessionResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateExplorerSessionResponse })
) {}
