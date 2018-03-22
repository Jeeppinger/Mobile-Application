import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { BaselinePage } from './baseline';

@NgModule({
  declarations: [
    BaselinePage,
  ],
  imports: [
    IonicPageModule.forChild(BaselinePage),
  ],
})
export class BaselinePageModule {}
