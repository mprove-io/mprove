import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendGetOrgsListRequest,
  zToBackendGetOrgsListResponse
} from '#common/zod/to-backend/orgs/to-backend-get-orgs-list';

export class ToBackendGetOrgsListRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetOrgsListRequest })
) {}

export class ToBackendGetOrgsListResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetOrgsListResponse })
) {}
