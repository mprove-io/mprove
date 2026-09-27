import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendCreateSessionSseTicketRequest } from '#common/zod/backend/routes/sessions/create-session-sse-ticket/create-session-sse-ticket-request';
import { zToBackendCreateSessionSseTicketResponse } from '#common/zod/backend/routes/sessions/create-session-sse-ticket/create-session-sse-ticket-response';

export class ToBackendCreateSessionSseTicketRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateSessionSseTicketRequest })
) {}

export class ToBackendCreateSessionSseTicketResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateSessionSseTicketResponse })
) {}
