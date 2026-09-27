import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendDuplicateMconfigAndQueryRequest } from '#common/zod/backend/routes/mconfigs/duplicate-mconfig-and-query/duplicate-mconfig-and-query-request';
import { zToBackendDuplicateMconfigAndQueryResponse } from '#common/zod/backend/routes/mconfigs/duplicate-mconfig-and-query/duplicate-mconfig-and-query-response';

export class ToBackendDuplicateMconfigAndQueryRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDuplicateMconfigAndQueryRequest })
) {}

export class ToBackendDuplicateMconfigAndQueryResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDuplicateMconfigAndQueryResponse })
) {}
