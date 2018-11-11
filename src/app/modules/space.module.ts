import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';
import * as components from 'src/app/components/_index';
import { MenuModule } from 'src/app/modules/menu.module';
import { MyMaterialModule } from 'src/app/modules/my-material.module';
import { ProfileModule } from 'src/app/modules/profile.module';
import { ProjectModule } from 'src/app/modules/project.module';
import { SharedModule } from 'src/app/modules/shared.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    MyMaterialModule,
    FlexLayoutModule,
    MenuModule,
    ProfileModule,
    ProjectModule,
    RouterModule,
  ],
  declarations: [
    components.NavDevProdComponent,
    components.NavBlockmlComponent,
    components.NavModelsComponent,
    components.NavDashboardsComponent,
    components.NavRemoteErrorsComponent,
    components.SpaceComponent,
    components.ProjectDeletedComponent,
    components.LoginComponent,
    components.LogoutComponent,
    components.NotFound404Component,
  ],
  exports: [
    components.SpaceComponent
  ]
})

export class SpaceModule {
}
