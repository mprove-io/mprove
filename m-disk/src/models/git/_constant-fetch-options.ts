import * as nodegit from 'nodegit';

export const constantFetchOptions: nodegit.FetchOptions = {
  callbacks: {
    certificateCheck: () => 1
  },
  prune: 1
};
