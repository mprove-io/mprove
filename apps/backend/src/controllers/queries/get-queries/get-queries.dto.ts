import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendGetQueriesRequest } from '#common/zod/backend/routes/queries/get-queries/get-queries-request';
import { zToBackendGetQueriesResponse } from '#common/zod/backend/routes/queries/get-queries/get-queries-response';

export class ToBackendGetQueriesRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetQueriesRequest })
) {}

export class ToBackendGetQueriesResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetQueriesResponse })
) {}
