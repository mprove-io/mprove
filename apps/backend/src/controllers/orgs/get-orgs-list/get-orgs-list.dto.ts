import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendGetOrgsListRequest } from '#common/zod/backend/routes/orgs/get-orgs-list/get-orgs-list-request';
import { zToBackendGetOrgsListResponse } from '#common/zod/backend/routes/orgs/get-orgs-list/get-orgs-list-response';

export class ToBackendGetOrgsListRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetOrgsListRequest })
) {}

export class ToBackendGetOrgsListResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetOrgsListResponse })
) {}
