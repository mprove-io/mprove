import { NgModule } from '@angular/core';
import {
  CovalentCommonModule,
  CovalentDataTableModule,
  CovalentPagingModule,
  CovalentLoadingModule,
  CovalentStepsModule,
  CovalentFileModule
} from '@covalent/core';

const COVALENT_MODULES: any[] = [
  CovalentCommonModule,
  CovalentDataTableModule,
  CovalentPagingModule,
  CovalentLoadingModule,
  CovalentStepsModule,
  CovalentFileModule
];

@NgModule({
  imports: [COVALENT_MODULES],
  declarations: [],
  exports: [COVALENT_MODULES]
})
export class MyCovalentModule {}
