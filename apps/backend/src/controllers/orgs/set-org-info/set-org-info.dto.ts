import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendSetOrgInfoRequest,
  zToBackendSetOrgInfoResponse
} from '#common/zod/to-backend/orgs/to-backend-set-org-info';

export class ToBackendSetOrgInfoRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSetOrgInfoRequest })
) {}

export class ToBackendSetOrgInfoResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSetOrgInfoResponse })
) {}
