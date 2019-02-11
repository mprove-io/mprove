import { NgModule } from '@angular/core';
import * as pipes from '@app/pipes/_index';
import * as directives from '@app/directives/_index';

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
  imports: [],
  declarations: [...pipesArray, ...directivesArray],
  exports: [...pipesArray, ...directivesArray],
  providers: pipesArray
})
export class SharedModule {}
