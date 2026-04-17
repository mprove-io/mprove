import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendDeleteOrgRequest,
  zToBackendDeleteOrgResponse
} from '#common/zod/to-backend/orgs/to-backend-delete-org';

export class ToBackendDeleteOrgRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteOrgRequest })
) {}

export class ToBackendDeleteOrgResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteOrgResponse })
) {}
