import { z } from 'zod';
import { DiskEnvEnum } from '#common/enums/env/disk-env.enum';

export let zDiskConfig = z.object({
  isTelemetryEnabled: z.boolean(),
  telemetryEndpoint: z.string().optional(),
  telemetryHyperdxIngestApiKey: z.string().optional(),
  otelLogLevel: z.string().optional(),
  diskEnv: z.enum(DiskEnvEnum),
  aesKey: z.string(),
  diskShard: z.string(),
  diskConcurrency: z.number(),
  diskValkeyHost: z.string(),
  diskValkeyPassword: z.string(),
  diskOrganizationsPath: z.string(),
  diskIsCheckSymlinksOnStartup: z.boolean(),
  diskTestReposPath: z.string().optional(),
  diskTestLocalSourceGitUrl: z.string().optional(),
  diskLogIsJson: z.boolean(),
  diskLogResponseError: z.boolean(),
  diskLogResponseOk: z.boolean()
});

export type DiskConfig = z.infer<typeof zDiskConfig>;
