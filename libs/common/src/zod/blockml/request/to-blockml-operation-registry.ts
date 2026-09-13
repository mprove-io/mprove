import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { ToBlockmlOperation } from '#common/zod/blockml/request/to-blockml-operation';
import type { ToBlockmlRebuildStructRequest } from '#common/zod/blockml/routes/rebuild-struct/rebuild-struct-request';
import { zToBlockmlRebuildStructRequest } from '#common/zod/blockml/routes/rebuild-struct/rebuild-struct-request';
import type { ToBlockmlRebuildStructResponse } from '#common/zod/blockml/routes/rebuild-struct/rebuild-struct-response';
import { zToBlockmlRebuildStructResponse } from '#common/zod/blockml/routes/rebuild-struct/rebuild-struct-response';

export type ToBlockmlOperationRegistry = {
  rebuildStruct: {
    request: ToBlockmlRebuildStructRequest;
    response: ToBlockmlRebuildStructResponse;
  };
};

export const zToBlockmlOperationRegistry = {
  rebuildStruct: {
    request: zToBlockmlRebuildStructRequest,
    response: zToBlockmlRebuildStructResponse
  }
} satisfies {
  [TOperation in ToBlockmlOperation]: {
    request: z.ZodType<ToBlockmlOperationRegistry[TOperation]['request']>;
    response: z.ZodType<ToBlockmlOperationRegistry[TOperation]['response']>;
  };
};

assertTypesEqual<
  ToBlockmlOperationRegistry,
  {
    [TOperation in ToBlockmlOperation]: {
      request: z.infer<
        (typeof zToBlockmlOperationRegistry)[TOperation]['request']
      >;
      response: z.infer<
        (typeof zToBlockmlOperationRegistry)[TOperation]['response']
      >;
    };
  }
>({ value: true });
