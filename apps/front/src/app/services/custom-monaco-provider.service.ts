import { Injectable } from '@angular/core';
import { Monaco, MonacoProviderService } from 'ng-monaco-editor';
import { constants } from '~front/barrels/constants';

@Injectable({ providedIn: 'root' })
export class CustomMonacoProviderService extends MonacoProviderService {
  private ready?: Promise<Monaco>;

  override async initMonaco() {
    if (!this.ready) {
      this.ready = new Promise((resolve, reject) => {
        super
          .initMonaco()
          .then(monaco => {
            monaco.editor.defineTheme(
              constants.BLOCKML_THEME,
              constants.BLOCKML_THEME_DATA
            );

            resolve(monaco);
          })
          .catch(reject);
      });
    }
    return this.ready;
  }
}
