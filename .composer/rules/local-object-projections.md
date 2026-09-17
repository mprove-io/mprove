# Local object projections

For local object projections, prefer a named handwritten type over `Pick`. Use
explicit mapping when the runtime object must contain only the projected fields.

```ts
// correct
type ResponseModelPart = {
  modelId: string;
  name: string;
};

let responseModelParts: ResponseModelPart[] = models.map(model => ({
  modelId: model.modelId,
  name: model.name
}));

// wrong
type ResponseModelPart = Pick<LlmModel, 'modelId' | 'name'>;
```
