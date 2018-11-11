import { Injectable } from '@angular/core';
import * as configs from 'src/app/configs/_index';
import * as enums from 'src/app/enums/_index';
import { IPrinter } from 'src/app/services/printer.service';

// Declare the console as an ambient value so that TypeScript doesn't complain.
declare let console: any;

const main = MAIN;

// I log values to the ambient console object.
@Injectable()
export class ConsoleLogService implements IPrinter {

  constructor() {

  }

  assert(...args: any[]): void {

    if (console && console.assert) {
      console.assert(...args);
    }
  }


  error(...args: any[]): void {

    if (console && console.error) {
      console.error(...args);
    }
  }


  group(...args: any[]): void {

    if (console && console.group) {
      console.group(...args);
    }
  }


  groupEnd(...args: any[]): void {

    if (console && console.groupEnd) {
      console.groupEnd(...args);
    }
  }


  info(...args: any[]): void {

    if (console && console.info) {
      console.info(...args);
    }
  }


  log(bus: any, ...args: any[]): void {

    if ((<any>configs.printerConfig)[enums.busEnum[bus]] !== false && !main) { // logs if true or undefined

      if (console && console.log) {
        console.log((<any>enums.busEnum)[enums.busEnum[bus]], ...args);
      }
    }
  }


  warn(...args: any[]): void {

    if (console && console.warn) {
      console.warn(...args);
    }
  }

}
