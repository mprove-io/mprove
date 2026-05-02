import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendCloseExplorerSessionTabRequest,
  zToBackendCloseExplorerSessionTabResponse
} from '#common/zod/to-backend/sessions/to-backend-close-explorer-session-tab';

export class ToBackendCloseExplorerSessionTabRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCloseExplorerSessionTabRequest })
) {}

export class ToBackendCloseExplorerSessionTabResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCloseExplorerSessionTabResponse })
) {}
