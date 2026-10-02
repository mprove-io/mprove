import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendDeleteDraftReportsRequest } from '#common/types/backend/routes/reports/delete-draft-reports/delete-draft-reports-request';
import { zToBackendDeleteDraftReportsResponse } from '#common/types/backend/routes/reports/delete-draft-reports/delete-draft-reports-response';

export class ToBackendDeleteDraftReportsRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteDraftReportsRequest })
) {}

export class ToBackendDeleteDraftReportsResponseDto extends createBackendResponseDto(
  { schema: zToBackendDeleteDraftReportsResponse }
) {}
