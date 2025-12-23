import * as fse from 'fs-extra';
import * as nodegit from 'nodegit';
import { ProjectRemoteTypeEnum } from '~common/enums/project-remote-type.enum';

export function makeFetchOptions(item: {
  remoteType: ProjectRemoteTypeEnum;
  keyDir: string;
  gitUrl: string;
  publicKey: string;
  privateKeyEncrypted: string;
  passPhrase: string;
}) {
  let {
    remoteType,
    keyDir,
    gitUrl,
    publicKey,
    privateKeyEncrypted,
    passPhrase
  } = item;

  let pubKeyPath = `${keyDir}/id_rsa.pub`;
  let privateKeyPath = `${keyDir}/id_rsa`;

  if (remoteType === ProjectRemoteTypeEnum.GitClone) {
    fse.writeFileSync(pubKeyPath, publicKey);
    fse.writeFileSync(privateKeyPath, privateKeyEncrypted);
  }

  let fetchOptions: nodegit.FetchOptions =
    remoteType === ProjectRemoteTypeEnum.GitClone
      ? {
          callbacks: {
            certificateCheck: () => 0,
            credentials: function (url: any, userName: any) {
              return (nodegit as any).Credential.sshKeyNew(
                'git',
                pubKeyPath,
                privateKeyPath,
                passPhrase
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
