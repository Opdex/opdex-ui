import { SharedPipesModule } from '@sharedPipes/shared-pipes.module';
// Angular Core Imports
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// CDK Imports
import { ClipboardModule } from '@angular/cdk/clipboard';

// Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';

// Opdex Component Imports
import { ChangeIndicatorComponent } from './change-indicator/change-indicator.component';
import { CopyButtonComponent } from './copy-button/copy-button.component';
import { CopyAddressComponent } from './copy-address/copy-address.component';
import { HelpButtonComponent } from './help-button/help-button.component';
import { QrCodeComponent } from './qr-code/qr-code.component';

// Other Imports
import { QrCodeModule } from 'ng-qrcode';

@NgModule({
  declarations: [
    ChangeIndicatorComponent,
    CopyButtonComponent,
    HelpButtonComponent,
    QrCodeComponent,
    CopyAddressComponent
  ],
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatTooltipModule,
    MatButtonModule,
    ClipboardModule,
    SharedPipesModule,
    QrCodeModule
  ],
  exports: [
    ChangeIndicatorComponent,
    CopyButtonComponent,
    MatIconModule,
    MatButtonModule,
    ChangeIndicatorComponent,
    HelpButtonComponent,
    QrCodeComponent,
    CopyAddressComponent
  ]
})
export class SharedModule { }
