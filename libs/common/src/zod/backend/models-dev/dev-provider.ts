import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import { type DevModel, zDevModel } from './dev-model';

// Provider entry returned by the models.dev API.
export type DevProvider = {
  api?: string;
  name: string;
  env: string[];
  id: string;
  npm?: string;
  models: Record<string, DevModel>;
};

// Root response returned by the models.dev API.
export type ModelsDevResponse = Record<string, DevProvider>;

export let zDevProvider = z
  .object({
    api: z.string().nullish(),
    name: z.string(),
    env: z.array(z.string()),
    id: z.string(),
    npm: z.string().nullish(),
    models: z.record(z.string(), zDevModel)
  })
  .meta({ id: 'DevProvider' });

assertTypesEqual<DevProvider, z.infer<typeof zDevProvider>>({
  value: true
});
