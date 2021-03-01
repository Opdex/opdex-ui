import { PlatformApiService } from './../../services/api/platform-api.service';
import { Component, OnInit } from '@angular/core';
import { ThemeService } from '@sharedServices/theme.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'opdex-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit {
  chartType: string = 'Area';
  ohlcPoints: any[];
  theme$: Observable<string>;
  market: any;

  constructor(
    private _themeService: ThemeService,
    private _platformApiService: PlatformApiService
  ) {
    this.theme$ = this._themeService.getTheme();
  }

  async ngOnInit(): Promise<void> {
    setTimeout(() => {
      this.ohlcPoints = [
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
    }, 100)

    const marketResponse = await this._platformApiService.getMarketOverview();
    if (marketResponse.hasError || !marketResponse.data) {
      // handle
    }

    this.market = marketResponse.data;

    console.log(this.market);
  }

  dateToChartTime(date:Date) {
    return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), 0) / 1000;
  };
}
