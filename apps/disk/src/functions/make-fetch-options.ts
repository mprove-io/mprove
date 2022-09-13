import * as nodegit from 'nodegit';
import { common } from '~disk/barrels/common';

export function makeFetchOptions(item: {
  remoteType: common.ProjectRemoteTypeEnum;
  gitUrl?: string;
  publicKey?: string;
  privateKey?: string;
}) {
  let fetchOptions: nodegit.FetchOptions =
    item.remoteType === common.ProjectRemoteTypeEnum.GitClone
      ? {
          callbacks: {
            certificateCheck: () => 0,
            credentials: (url: any, userName: any) =>
              nodegit.Cred.sshKeyMemoryNew(
                userName,
                item.publicKey,
                item.privateKey,
                '' // passphrase
              )
          },
          prune: 1
        }
      : {
          callbacks: {
            certificateCheck: () => 1
          },
          prune: 1
        };

  return fetchOptions;
}
