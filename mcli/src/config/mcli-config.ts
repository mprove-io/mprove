import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type McliConfig = {
  mproveCliHost: string;
  mproveCliApiKey?: string;
  mproveCliProjectId?: string;
  mproveCliTestReposPath?: string;
  mproveCliTestLocalSourceGitUrl?: string;
  mproveCliTestDevSourceGitUrl?: string;
  mproveCliTestPublicKeyPath?: string;
  mproveCliTestPrivateKeyEncryptedPath?: string;
  mproveCliTestPassPhrase?: string;
  mproveCliTestDwhPostgresUser?: string;
  mproveCliTestDwhPostgresPassword?: string;
};

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

assertTypesEqual<McliConfig, z.infer<typeof zMcliConfig>>({ value: true });
