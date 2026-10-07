import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendDuplicateMconfigAndQueryRequest } from '#common/types/backend/routes/mconfigs/duplicate-mconfig-and-query/duplicate-mconfig-and-query-request';
import { zToBackendDuplicateMconfigAndQueryResponse } from '#common/types/backend/routes/mconfigs/duplicate-mconfig-and-query/duplicate-mconfig-and-query-response';

export class ToBackendDuplicateMconfigAndQueryRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDuplicateMconfigAndQueryRequest })
) {}

export class ToBackendDuplicateMconfigAndQueryResponseDto extends createBackendResponseDto(
  { schema: zToBackendDuplicateMconfigAndQueryResponse }
) {}
