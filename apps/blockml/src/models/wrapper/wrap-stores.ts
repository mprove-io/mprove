import { common } from '~blockml/barrels/common';

export function wrapStores(item: { stores: common.FileStore[] }) {
  let { stores } = item;

  let apiStores: common.Store[] = stores.map(x => {
    let store: common.Store = {
      storeId: x.name,
      filePath: x.filePath
    };
    return store;
  });

  return apiStores;
}
