import { NgModule } from '@angular/core';
import {
  CovalentCommonModule,
  CovalentDataTableModule,
  CovalentPagingModule,
  CovalentLoadingModule,
  CovalentStepsModule,
  CovalentFileModule
} from '@covalent/core';
import { CovalentCodeEditorModule } from '@covalent/code-editor';

const COVALENT_MODULES: any[] = [
  CovalentCodeEditorModule,
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
