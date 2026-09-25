// https://github.com/sindresorhus/clone-regexp/blob/main/index.js

export function cloneRegexp(regexp: any, options: any = {}) {
  if (toString.call(regexp) !== '[object RegExp]') {
    throw new TypeError('Expected a RegExp instance');
  }

  let flagMap: any = {
    global: 'g',
    ignoreCase: 'i',
    multiline: 'm',
    dotAll: 's',
    sticky: 'y',
    unicode: 'u'
  };

  const flags = Object.keys(flagMap)
    .map(flag =>
      (typeof options[flag] === 'boolean' ? options[flag] : regexp[flag])
        ? flagMap[flag]
        : ''
    )
    .join('');

  const clonedRegexp = new RegExp(options.source || regexp.source, flags);

  clonedRegexp.lastIndex =
    typeof options.lastIndex === 'number'
      ? options.lastIndex
      : regexp.lastIndex;

  return clonedRegexp;
}
