import { z } from 'zod';

export let zMcliConfig = z.object({
  mproveCliHost: z.string(),
  mproveCliApiKey: z.string().optional(),
  mproveCliProjectId: z.string().optional(),
  mproveCliTestReposPath: z.string().optional(),
  mproveCliTestLocalSourceGitUrl: z.string().optional(),
  mproveCliTestDevSourceGitUrl: z.string().optional(),
  mproveCliTestPublicKeyPath: z.string().optional(),
  mproveCliTestPrivateKeyEncryptedPath: z.string().optional(),
  mproveCliTestPassPhrase: z.string().optional(),
  mproveCliTestDwhPostgresUser: z.string().optional(),
  mproveCliTestDwhPostgresPassword: z.string().optional()
});

export type McliConfig = z.infer<typeof zMcliConfig>;
