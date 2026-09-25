import type { StatusResult } from 'simple-git';

export type DestinationChange = {
  status: 'deleted' | 'modified' | 'new';
  path: string;
};

export function getDestinationOnlyChanges(item: {
  statusResult: StatusResult;
  payloadPaths: Set<string>;
}): DestinationChange[] {
  let { statusResult, payloadPaths } = item;

  let changes: DestinationChange[] = [];

  let addChange = (change: DestinationChange) => {
    if (payloadPaths.has(change.path) === false) {
      changes.push(change);
    }
  };

  statusResult.not_added.forEach(filePath => {
    addChange({ status: 'deleted', path: filePath });
  });

  statusResult.created.forEach(filePath => {
    addChange({ status: 'deleted', path: filePath });
  });

  statusResult.deleted.forEach(filePath => {
    addChange({ status: 'new', path: filePath });
  });

  statusResult.modified.forEach(filePath => {
    addChange({ status: 'modified', path: filePath });
  });

  statusResult.renamed.forEach(file => {
    addChange({ status: 'new', path: file.from });
    addChange({ status: 'deleted', path: file.to });
  });

  statusResult.conflicted.forEach(filePath => {
    addChange({ status: 'modified', path: filePath });
  });

  return changes;
}
