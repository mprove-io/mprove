import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendGetOrgRequest,
  zToBackendGetOrgResponse
} from '#common/zod/to-backend/orgs/to-backend-get-org';

export class ToBackendGetOrgRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetOrgRequest })
) {}

export class ToBackendGetOrgResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetOrgResponse })
) {}
