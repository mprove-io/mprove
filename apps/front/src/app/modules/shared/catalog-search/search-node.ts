export const CATALOG_SEARCH_PREVIEW_LIMIT = 50;

export type SearchNode =
  | { kind: 'folder'; id: string; label: string; children: SearchNode[] }
  | {
      kind: 'result';
      id: string;
      label: string;
      matchedFieldLabels?: string[];
    };
