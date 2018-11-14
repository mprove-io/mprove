import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TreeModule } from 'angular-tree-component';
import { AceEditorModule } from 'ng2-ace-editor';
import { ClipboardModule } from 'ngx-clipboard';
import * as components from 'app/components/_index';
import { ColorPickerModule } from 'app/modules/colorpicker/colorpicker.module';
import { FractionModule } from 'app/modules/fraction.module';
import { MyCovalentModule } from 'app/modules/my-covalent.module';
import { MyMaterialModule } from 'app/modules/my-material.module';
import { SharedModule } from 'app/modules/shared.module';
import { ValidationMsgModule } from 'app/modules/validation-msg.module';
import { VisualModule } from 'app/modules/visual.module';

@NgModule({
  imports: [
    SharedModule,
    ClipboardModule,
    AceEditorModule,
    FractionModule,
    CommonModule,
    MyMaterialModule,
    MyCovalentModule,
    ColorPickerModule,
    FlexLayoutModule,
    RouterModule,
    ReactiveFormsModule,
    TreeModule,
    VisualModule,
    ValidationMsgModule
  ],
  declarations: [
    components.ModelComponent,
    components.ModelTreeComponent,
    components.ModelFiltersComponent,
    components.MconfigComponent,
    components.QueryComponent,
    components.SqlComponent,
    components.SqlPartComponent,
    components.DataComponent,
    components.DragTableComponent,
    components.ChartComponent,
    components.ChartEditorComponent,
    components.ChartViewerComponent
  ],
  entryComponents: [],
  exports: [components.ModelComponent]
})
export class ModelModule {}
