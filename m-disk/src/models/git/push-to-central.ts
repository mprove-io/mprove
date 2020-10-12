import * as nodegit from 'nodegit';
import { constantFetchOptions } from './_constant-fetch-options';

export async function pushToCentral(item: { fromRepoDir: string }) {
  let gitRepo = <nodegit.Repository>(
    await nodegit.Repository.open(item.fromRepoDir)
  );

  let originRemote = <nodegit.Remote>await gitRepo.getRemote('origin');

  await originRemote.push(
    ['refs/heads/master:refs/heads/master'],
    constantFetchOptions
  );
}
