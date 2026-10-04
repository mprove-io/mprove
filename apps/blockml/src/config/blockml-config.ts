import { z } from 'zod';
import { zFunc } from '#common/types/blockml/diagnostics/func';
import { zBlockmlEnv } from '#common/types/node-common/env/blockml-env';

export let zBlockmlConfig = z.object({
  isTelemetryEnabled: z.boolean(),
  telemetryEndpoint: z.string().optional(),
  telemetryHyperdxIngestApiKey: z.string().optional(),
  otelLogLevel: z.string().optional(),
  blockmlEnv: zBlockmlEnv,
  aesKey: z.string(),
  logIO: z.boolean(),
  logFunc: zFunc,
  copyLogsToModels: z.boolean(),
  logsPath: z.string(),
  concurrencyLimit: z.number().int(),
  blockmlValkeyHost: z.string(),
  blockmlValkeyPassword: z.string(),
  blockmlData: z.string(),
  blockmlTestsDwhPostgresHost: z.string().optional(),
  blockmlTestsDwhPostgresPort: z.string().optional(),
  blockmlTestsDwhPostgresUsername: z.string().optional(),
  blockmlTestsDwhPostgresPassword: z.string().optional(),
  blockmlTestsDwhPostgresDatabaseName: z.string().optional(),
  blockmlLogIsJson: z.boolean(),
  blockmlLogResponseError: z.boolean(),
  blockmlLogResponseOk: z.boolean()
});

export type BlockmlConfig = z.infer<typeof zBlockmlConfig>;
