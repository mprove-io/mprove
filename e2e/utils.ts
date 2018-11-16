import { ElementFinder, promise, by, browser, element } from 'protractor';
import { appearTime } from './e2e.config';
import { protractor } from 'protractor/built/ptor';

export function consoleMessage(message: string): void {
  console.log('\n');
  console.log('\x1b[32m%s\x1b[0m', message);
}

export function clickTrue(el: ElementFinder): promise.Promise<boolean> {
  return el.click().then(() => true, () => {});
}

export function wait(time: number) {
  return new Promise(resolve => {
    setTimeout(() => resolve(), time);
  });
}

// export function clickAfterClickable(el: ElementFinder): promise.Promise<boolean> {
//   return new promise.Promise(resolve => {
//     let interval = setInterval(
//       () => {
//         el.click().then(
//           () => {
//             clearInterval(interval);
//             setTimeout(
//               () => {
//                 resolve(true);
//               },
//               500
//             );
//           },
//           () => { }
//         );
//       },
//       250);
//   });
// }

// export function releaseAfterNotClickable(el: ElementFinder): promise.Promise<boolean> {
//   return new promise.Promise(resolve => {
//     let interval = setInterval(
//       () => {
//         el.click().then(
//           () => { },
//           () => {
//             clearInterval(interval);
//             resolve(true);
//             // setTimeout(
//             //   () => {
//             //     resolve(true);
//             //   },
//             //   500
//             // );
//           }
//         );
//       },
//       50);
//   });
// }
