import * as nodegit from '@figma/nodegit';
import * as fse from 'fs-extra';
import { PASS_PHRASE } from '~common/constants/top';
import { ProjectRemoteTypeEnum } from '~common/enums/project-remote-type.enum';

export function makeFetchOptions(item: {
  remoteType: ProjectRemoteTypeEnum;
  keyDir: string;
  gitUrl?: string;
  publicKey?: string;
  privateKey?: string;
}) {
  let pubKeyPath = `${item.keyDir}/id_rsa.pub`;
  let privateKeyPath = `${item.keyDir}/id_rsa`;

  if (item.remoteType === ProjectRemoteTypeEnum.GitClone) {
    fse.writeFileSync(pubKeyPath, item.publicKey);
    fse.writeFileSync(privateKeyPath, item.privateKey);
  }

  let fetchOptions: nodegit.FetchOptions =
    item.remoteType === ProjectRemoteTypeEnum.GitClone
      ? {
          callbacks: {
            certificateCheck: () => 0,
            credentials: function (url: any, userName: any) {
              return (nodegit as any).Credential.sshKeyNew(
                'git',
                pubKeyPath,
                privateKeyPath,
                PASS_PHRASE
              );
            }
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
