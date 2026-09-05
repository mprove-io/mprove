import { z } from 'zod';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import { type RequestInfo, zRequestInfo } from '#common/zod/to/request-info';

export type ToDiskRequestInfo = Extend<
  RequestInfo,
  {
    name: (typeof ToDiskRequestInfoNameEnum)[keyof typeof ToDiskRequestInfoNameEnum];
    traceId: string;
  }
>;

export let zToDiskRequestInfo = zRequestInfo
  .extend({
    name: z.enum(ToDiskRequestInfoNameEnum),
    traceId: z.string()
  })
  .meta({ id: 'ToDiskRequestInfo' });

assertTypesEqual<ToDiskRequestInfo, z.infer<typeof zToDiskRequestInfo>>({
  value: true
});
