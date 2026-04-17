import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendGetQueryRequest,
  zToBackendGetQueryResponse
} from '#common/zod/to-backend/queries/to-backend-get-query';

export class ToBackendGetQueryRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetQueryRequest })
) {}

export class ToBackendGetQueryResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetQueryResponse })
) {}
