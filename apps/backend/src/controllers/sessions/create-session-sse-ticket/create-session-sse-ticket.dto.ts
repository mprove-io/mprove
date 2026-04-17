import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendCreateSessionSseTicketRequest,
  zToBackendCreateSessionSseTicketResponse
} from '#common/zod/to-backend/sessions/to-backend-create-session-sse-ticket';

export class ToBackendCreateSessionSseTicketRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateSessionSseTicketRequest })
) {}

export class ToBackendCreateSessionSseTicketResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateSessionSseTicketResponse })
) {}
