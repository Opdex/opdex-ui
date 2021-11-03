import { IVaultCertificates } from '@sharedModels/platform-api/responses/vaults/vault-certificate.interface';
import { Component, EventEmitter, Input, OnChanges, Output, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Icons } from 'src/app/enums/icons';

@Component({
  selector: 'opdex-vault-certificates-table',
  templateUrl: './vault-certificates-table.component.html',
  styleUrls: ['./vault-certificates-table.component.scss']
})
export class VaultCertificatesTableComponent implements OnChanges {
  displayedColumns: string[];
  dataSource: MatTableDataSource<any>;
  @Input() certificates: IVaultCertificates;
  previous: string;
  next: string;
  icons = Icons;

  @Output() onPageChange: EventEmitter<string> = new EventEmitter();
  @ViewChild(MatSort) sort: MatSort;

  constructor() {
    this.dataSource = new MatTableDataSource<any>();
    this.displayedColumns = ['owner', 'amount', 'revoked', 'redeemed', 'vestingStart', 'vestingEnd'];
  }

  ngOnChanges() {
    if (this.certificates) {
      this.dataSource.data = this.certificates.results;
      this.next = this.certificates.paging.next;
      this.previous = this.certificates.paging.previous;
    }
  }

  pageChange(cursor: string) {
    this.onPageChange.emit(cursor);
  }

  trackBy(index: number, pool: any) {
    return pool.name + pool.address
  }
}
