import { ErrorFactory } from '@praha/error-factory';

export class DiskSymlinksFoundError extends ErrorFactory({
  name: 'DiskSymlinksFoundError',
  message: fields =>
    `Symlinks found under ${fields.dir}. Remove them before starting disk:\n${fields.symlinks.join('\n')}`,
  fields: ErrorFactory.fields<{
    dir: string;
    symlinks: string[];
  }>()
}) {}
