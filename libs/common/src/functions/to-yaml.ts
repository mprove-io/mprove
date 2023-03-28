import { dump } from 'js-yaml';

export function toYaml(x: any) {
  return dump(x, {
    noRefs: true,
    flowLevel: -1,
    noArrayIndent: true
  })
    .split('\n')
    .map(s =>
      s
        .replace(/^[-]\sfilter:/g, '\n- filter:')
        .replace(/^[-]\stitle:/g, '\n- title:')
        .replace(/^[-]\srow_id:/g, '\n- row_id:')
        .replace(/^\s\s[-]\sid:/g, '\n  - id:')
        .replace(/'''/g, `'`)
    )
    .join('\n')
    .split('fields:\n\n')
    .join('fields:\n')
    .split('reports:\n\n')
    .join('reports:\n')
    .split('rows:\n\n')
    .join('rows:\n')
    .split('parameters:\n\n')
    .join('parameters:\n');
}
