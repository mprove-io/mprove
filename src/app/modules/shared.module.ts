import { NgModule } from '@angular/core';
import * as pipes from 'app/pipes/_index';

const pipesArray = [
  pipes.CapitalizePipe,
  pipes.GroupByPipe,
  pipes.HideColumnsPipe,
  pipes.ExtensionPipe,
  pipes.ChartIconPipe
];

@NgModule({
  imports: [],
  declarations: pipesArray,
  exports: pipesArray,
  providers: pipesArray
})
export class SharedModule {}
