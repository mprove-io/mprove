import { z } from 'zod';
import { BlockmlEnvEnum } from '#common/enums/env/blockml-env.enum';
import { FuncEnum } from '#common/enums/special/func.enum';

export let zBlockmlConfig = z.object({
  isTelemetryEnabled: z.boolean(),
  telemetryEndpoint: z.string().optional(),
  telemetryHyperdxIngestApiKey: z.string().optional(),
  otelLogLevel: z.string().optional(),
  blockmlEnv: z.enum(BlockmlEnvEnum),
  aesKey: z.string(),
  logIO: z.boolean(),
  logFunc: z.enum(FuncEnum),
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
