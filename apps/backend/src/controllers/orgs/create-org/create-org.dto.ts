import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendCreateOrgRequest,
  zToBackendCreateOrgResponse
} from '#common/zod/to-backend/orgs/to-backend-create-org';

export class ToBackendCreateOrgRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateOrgRequest })
) {}

export class ToBackendCreateOrgResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateOrgResponse })
) {}
