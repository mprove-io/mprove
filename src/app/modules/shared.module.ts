import { NgModule } from '@angular/core';
import * as pipes from '@app/pipes/_index';
import * as directives from '@app/directives/_index';
import { MonacoEditorModule } from 'ngx-monaco-editor';

const pipesArray = [
  pipes.CapitalizePipe,
  pipes.GroupByPipe,
  pipes.HideColumnsPipe,
  pipes.ExtensionPipe,
  pipes.ChartIconPipe
];

const directivesArray = [
  directives.SingleClickDirective,
  directives.DisableControlDirective
];

@NgModule({
  imports: [MonacoEditorModule.forRoot()],
  declarations: [...pipesArray, ...directivesArray],
  exports: [...pipesArray, ...directivesArray, MonacoEditorModule],
  providers: pipesArray
})
export class SharedModule {}
