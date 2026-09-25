import type { MalloyAnnotations } from '#blockml/controllers/rebuild-struct/rebuild-struct-stateless/rebuild-configured-struct/build-compiled-models/build-mod-start/build-flat-malloy-field-items/get-malloy-field-items/get-malloy-source-annotation-values/collect-malloy-source-annotation-values-recursive/collect-malloy-source-annotation-values-recursive';
import type { MalloySourceExpression } from '#common/zod/blockml/internal/flat-malloy-field-item';

export type MalloySourceField = {
  accessModifier?: string;
  as?: string;
  name?: string;
  type?: string;
  expressionType?: string;
  annotations?: MalloyAnnotations;
  fields?: MalloySourceField[];
  e?: MalloySourceExpression;
  location?: {
    url?: string;
    range?: {
      start?: {
        line?: number;
      };
    };
  };
};
