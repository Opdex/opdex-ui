import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'opdex-token',
  templateUrl: './token.component.html',
  styleUrls: ['./token.component.scss']
})
export class TokenComponent implements OnInit {
  chartType: string = 'Area';
  ohlcPoints: any[] = [
    {
      open: 1,
      high: 3,
      low: 0,
      close: 2,
      time: this.dateToChartTime(new Date(2020, 12, 11))
    },
    {
      open: 2,
      high: 3,
      low: 0,
      close: 3,
      time: this.dateToChartTime(new Date(2020, 12, 12))
    },
    {
      open: 3,
      high: 3,
      low: 0,
      close: 4,
      time: this.dateToChartTime(new Date(2020, 12, 13))
    },
    {
      open: 3,
      high: 3,
      low: 0,
      close: 3,
      time: this.dateToChartTime(new Date(2020, 12, 14))
    },
    {
      open: 3,
      high: 6,
      low: 0,
      close: 6,
      time: this.dateToChartTime(new Date(2020, 12, 15))
    },
    {
      open: 6,
      high: 6,
      low: 0,
      close: 5,
      time: this.dateToChartTime(new Date(2020, 12, 16))
    }
  ];
  constructor() { }

  ngOnInit(): void {
  }

  dateToChartTime(date:Date) {
    return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), 0) / 1000;
  };
}
