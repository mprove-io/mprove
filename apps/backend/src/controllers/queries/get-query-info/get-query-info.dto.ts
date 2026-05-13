import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendGetQueryInfoRequest,
  zToBackendGetQueryInfoResponse
} from '#common/zod/to-backend/query-info/to-backend-get-query-info';

export class ToBackendGetQueryInfoRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetQueryInfoRequest })
) {}

export class ToBackendGetQueryInfoResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetQueryInfoResponse })
) {}
