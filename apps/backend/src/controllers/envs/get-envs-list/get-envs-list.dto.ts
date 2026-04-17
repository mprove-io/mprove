import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendGetEnvsListRequest,
  zToBackendGetEnvsListResponse
} from '#common/zod/to-backend/envs/to-backend-get-envs-list';

export class ToBackendGetEnvsListRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetEnvsListRequest })
) {}

export class ToBackendGetEnvsListResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetEnvsListResponse })
) {}
