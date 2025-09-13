import { ConnectionBigqueryOptions } from './connection-bigquery-options';
import { ConnectionMotherduckOptions } from './connection-motherduck-options';

export type ConnectionOptions =
  | ConnectionMotherduckOptions
  | ConnectionBigqueryOptions;
