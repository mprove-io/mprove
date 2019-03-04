export class MyError extends Error {
  constructor(public data: any) {
    super();

    this.name = data.name;

    this.message = `${data.name}: ${data.message}`;

    // this.stack = (<any>new Error()).stack;
  }
}
