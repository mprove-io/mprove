import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendCloseExplorerSessionTabRequest } from '#common/zod/backend/routes/sessions/close-explorer-session-tab/close-explorer-session-tab-request';
import { zToBackendCloseExplorerSessionTabResponse } from '#common/zod/backend/routes/sessions/close-explorer-session-tab/close-explorer-session-tab-response';

export class ToBackendCloseExplorerSessionTabRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCloseExplorerSessionTabRequest })
) {}

export class ToBackendCloseExplorerSessionTabResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCloseExplorerSessionTabResponse })
) {}
