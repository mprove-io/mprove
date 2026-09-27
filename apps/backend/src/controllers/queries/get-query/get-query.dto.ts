import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendGetQueryRequest } from '#common/zod/backend/routes/queries/get-query/get-query-request';
import { zToBackendGetQueryResponse } from '#common/zod/backend/routes/queries/get-query/get-query-response';

export class ToBackendGetQueryRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetQueryRequest })
) {}

export class ToBackendGetQueryResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetQueryResponse })
) {}
