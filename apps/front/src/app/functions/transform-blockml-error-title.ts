export function transformBlockmlErrorTitle(x: string) {
  let ar = x.split('_');
  // if (ar[0] === 'BACKEND') {
  //   ar.shift();
  // }

  return ar.join(' ');
}
