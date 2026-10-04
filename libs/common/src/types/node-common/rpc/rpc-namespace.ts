import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

const rpcNamespaceValues = ['rpc-blockml', 'rpc-disk'] as const;

export type RpcNamespace = (typeof rpcNamespaceValues)[number];

export let zRpcNamespace = z.enum(rpcNamespaceValues);

assertTypesEqual<RpcNamespace, z.infer<typeof zRpcNamespace>>({
  value: true
});
