import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TreeModule } from 'angular-tree-component';
import { AceEditorModule } from 'ng2-ace-editor';
import * as components from 'src/app/components/_index';
import { MyCovalentModule } from 'src/app/modules/my-covalent.module';
import { MyMaterialModule } from 'src/app/modules/my-material.module';
import { SharedModule } from 'src/app/modules/shared.module';
import { ValidationMsgModule } from 'src/app/modules/validation-msg.module';


@NgModule({
  imports: [
    SharedModule,
    AceEditorModule,
    CommonModule,
    MyMaterialModule,
    FlexLayoutModule,
    RouterModule,
    ReactiveFormsModule,
    TreeModule,
    ValidationMsgModule,
    MyCovalentModule,
  ],
  declarations: [
    components.BlockMLComponent,
    components.CatalogTreeComponent,
    components.FileEditorComponent,
    components.ErrorsComponent,
  ],
  entryComponents: [
  ],
  exports: [
    components.BlockMLComponent
  ]
})

export class BlockMLModule {
}
