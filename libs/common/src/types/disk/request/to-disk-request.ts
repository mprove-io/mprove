import type { ToDiskOperation } from '#common/types/disk/request/to-disk-operation';
import type { ToDiskRequestForOperation } from '#common/types/disk/request/to-disk-request-for-operation';

export type ToDiskRequest = ToDiskRequestForOperation<ToDiskOperation>;
