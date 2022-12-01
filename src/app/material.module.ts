import { NgModule } from '@angular/core';
import { OverlayModule } from '@angular/cdk/overlay';
import { A11yModule } from '@angular/cdk/a11y';
import { BidiModule } from '@angular/cdk/bidi';
import { ObserversModule } from '@angular/cdk/observers';
import { PortalModule } from '@angular/cdk/portal';
import { MatCommonModule, MatRippleModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
const MATERIAL_MODULES = [
MatButtonModule,
MatCardModule,
MatFormFieldModule,
MatInputModule,
MatProgressSpinnerModule,
MatRippleModule,
MatSnackBarModule,
MatToolbarModule,
OverlayModule,
PortalModule,
BidiModule,
A11yModule,
MatCommonModule,
    ObserversModule,
    MatIconModule
];
@NgModule({
imports: MATERIAL_MODULES,
declarations: [],
exports: MATERIAL_MODULES,
})
export class MaterialModule { }