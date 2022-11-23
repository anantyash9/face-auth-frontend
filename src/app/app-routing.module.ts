import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FaceTrackingComponent } from './components/face-tracking/face-tracking.component';
const routes: Routes = [{ path: '', component: FaceTrackingComponent }];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
