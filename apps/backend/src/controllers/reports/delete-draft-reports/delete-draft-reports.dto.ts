import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendDeleteDraftReportsRequest } from '#common/zod/backend/routes/reports/delete-draft-reports/delete-draft-reports-request';
import { zToBackendDeleteDraftReportsResponse } from '#common/zod/backend/routes/reports/delete-draft-reports/delete-draft-reports-response';

export class ToBackendDeleteDraftReportsRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteDraftReportsRequest })
) {}

export class ToBackendDeleteDraftReportsResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteDraftReportsResponse })
) {}
