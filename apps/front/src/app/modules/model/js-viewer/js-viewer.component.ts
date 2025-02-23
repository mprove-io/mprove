import { ChangeDetectorRef, Component } from '@angular/core';
import { MonacoEditorOptions } from 'ng-monaco-editor';
import { tap } from 'rxjs/operators';
import { MqQuery } from '~front/app/queries/mq.query';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';

@Component({
  selector: 'm-js-viewer',
  templateUrl: './js-viewer.component.html'
})
export class JsViewerComponent {
  editorOptions: MonacoEditorOptions = {
    readOnly: true,
    renderValidationDecorations: 'off',
    theme: constants.TEXTMATE_THEME,
    language: constants.JAVASCRIPT_LANGUAGE_ID,
    fontSize: 16,
    fixedOverflowWidgets: true
  };

  content: string;

  mconfig: common.MconfigX;
  mconfig$ = this.mqQuery.mconfig$.pipe(
    tap(x => {
      this.mconfig = x;
      this.content = `
//
// function to make resquest url path
//
${x.storePart?.urlPathFunc}
//
// function to make request body
//
${x.storePart?.bodyFunc}`;
      this.cd.detectChanges();
    })
  );

  constructor(private cd: ChangeDetectorRef, private mqQuery: MqQuery) {}
}
