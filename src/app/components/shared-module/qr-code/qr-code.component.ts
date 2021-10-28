import { Component, Input } from '@angular/core';
import { Icons } from 'src/app/enums/icons';

@Component({
  selector: 'opdex-qr-code',
  templateUrl: './qr-code.component.html',
  styleUrls: ['./qr-code.component.scss']
})
export class QrCodeComponent {
  @Input() data: string;
  copied: boolean;
  icons = Icons;

  helpInfo = {
    title: 'QR Codes',
    paragraph: 'Displayed QR codes can be scanned and used for authentication and transaction quote validation. By scanning or copying the QR code in any wallet that follows Opdex QR code standards, the wallet can display and the user can verify or act on the encoded data.'
  }

  constructor() { }

  copyHandler() {
    this.copied = true;
    setTimeout(() => this.copied = false, 1000);
  }
}

