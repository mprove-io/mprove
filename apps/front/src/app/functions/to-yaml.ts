import { dump } from 'js-yaml';

export function toYaml(x: any) {
  return dump(x)
    .split('\n')
    .map(s =>
      s
        .replace(/^\s\s/g, '')
        .replace(/^\s\s\s\s[-]/g, '  -')
        .replace(/^\s\s\s\s\s\s[-]/g, '    -')
        .replace(/'''/g, `'`)
    )
    .join('\n');
}
