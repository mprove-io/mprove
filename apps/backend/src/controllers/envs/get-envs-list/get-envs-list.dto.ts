import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendGetEnvsListRequest } from '#common/zod/backend/routes/envs/get-envs-list/get-envs-list-request';
import { zToBackendGetEnvsListResponse } from '#common/zod/backend/routes/envs/get-envs-list/get-envs-list-response';

export class ToBackendGetEnvsListRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetEnvsListRequest })
) {}

export class ToBackendGetEnvsListResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetEnvsListResponse })
) {}
