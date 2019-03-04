// import { ServerError } from '../../models/server-error';
// import { ServerResponseStatusEnum } from '../../swagger/model/models';
// import { erEnum } from '../../enums/er.enum';


// export async function toSpecial<T>(promise: Promise<T>, errorName: erEnum) {
//   return to(promise, errorName);
// }

// export async function toGit<T>(promise: Promise<T>) {
//   return to(promise, erEnum.GIT);
// }

// export async function toFunc<T>(promise: Promise<T>) {
//   return to(promise);
// }

// async function to<T>(promise: Promise<T>, errorName?: erEnum) {
//   return promise
//     .catch(err => {

//       if (err instanceof ServerError) {
//         throw err;

//       } else {

//         throw new ServerError({
//           name: errorName ? errorName : erEnum.INTERNAL,
//           originalError: err
//         });
//       }
//     });
// }

