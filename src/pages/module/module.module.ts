import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ModulePage } from './module';

@NgModule({
  declarations: [
    ModulePage,
  ],
  imports: [
    IonicPageModule.forChild(ModulePage),
  ],
  exports: [
    ModulePage
  ]
})
export class ModulePageModule {}
