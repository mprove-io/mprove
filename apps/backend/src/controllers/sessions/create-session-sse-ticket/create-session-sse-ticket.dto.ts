import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendCreateSessionSseTicketRequest } from '#common/types/backend/routes/sessions/create-session-sse-ticket/create-session-sse-ticket-request';
import { zToBackendCreateSessionSseTicketResponse } from '#common/types/backend/routes/sessions/create-session-sse-ticket/create-session-sse-ticket-response';

export class ToBackendCreateSessionSseTicketRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateSessionSseTicketRequest })
) {}

export class ToBackendCreateSessionSseTicketResponseDto extends createBackendResponseDto(
  { schema: zToBackendCreateSessionSseTicketResponse }
) {}
