import { ServerError } from '#common/classes/server-error/server-error';
import type { GetExplorerModelsError } from '#common/types/backend/function-errors/get-explorer-models-error';
import type { ProduceExplorerChartError } from '#common/types/backend/function-errors/produce-explorer-chart-error';
import type { RunProducerError } from '#common/types/backend/function-errors/run-producer-error';
import type { SearchModelFieldsError } from '#common/types/backend/function-errors/search-model-fields-error';

// AI tool callbacks and the producer still reject to trigger their existing
// protocol/status handling. Keep typed details until this terminal boundary.
export function makeExplorerToolError(item: {
  error:
    | GetExplorerModelsError
    | SearchModelFieldsError
    | ProduceExplorerChartError
    | RunProducerError;
}): ServerError {
  let { error } = item;

  let exception: ServerError = new ServerError({
    message: error.code,
    displayData: 'displayData' in error ? error.displayData : undefined,
    customData:
      'customData' in error
        ? error.customData
        : 'info' in error
          ? error.info
          : undefined,
    originalError:
      'originalError' in error && error.originalError
        ? Object.assign(new Error(error.originalError.code), {
            displayData:
              'displayData' in error.originalError
                ? error.originalError.displayData
                : undefined
          })
        : undefined
  });

  return exception;
}
