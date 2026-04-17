import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendDeleteDraftReportsRequest,
  zToBackendDeleteDraftReportsResponse
} from '#common/zod/to-backend/reports/to-backend-delete-draft-reports';

export class ToBackendDeleteDraftReportsRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteDraftReportsRequest })
) {}

export class ToBackendDeleteDraftReportsResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteDraftReportsResponse })
) {}
