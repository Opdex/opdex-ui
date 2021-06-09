import { ElementRef, Input } from '@angular/core';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ResizedEvent } from 'angular-resize-event';
import { createChart, IChartApi, ISeriesApi } from 'lightweight-charts';

const volume = [
	{ time: '2018-10-19', value: 19103293.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2018-10-22', value: 21737523.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2018-10-23', value: 29328713.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2018-10-24', value: 37435638.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2018-10-25', value: 25269995.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2018-10-26', value: 24973311.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2018-10-29', value: 22103692.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2018-10-30', value: 25231199.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2018-10-31', value: 24214427.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2018-11-01', value: 22533201.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2018-11-02', value: 14734412.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2018-11-05', value: 12733842.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2018-11-06', value: 12371207.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2018-11-07', value: 14891287.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2018-11-08', value: 12482392.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2018-11-09', value: 17365762.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2018-11-12', value: 13236769.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2018-11-13', value: 13047907.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2018-11-14', value: 18288710.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2018-11-15', value: 17147123.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2018-11-16', value: 19470986.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2018-11-19', value: 18405731.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2018-11-20', value: 22028957.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2018-11-21', value: 18482233.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2018-11-23', value: 7009050.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2018-11-26', value: 12308876.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2018-11-27', value: 14118867.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2018-11-28', value: 18662989.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2018-11-29', value: 14763658.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2018-11-30', value: 31142818.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2018-12-03', value: 27795428.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2018-12-04', value: 21727411.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2018-12-06', value: 26880429.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2018-12-07', value: 16948126.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2018-12-10', value: 16603356.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2018-12-11', value: 14991438.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2018-12-12', value: 18892182.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2018-12-13', value: 15454706.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2018-12-14', value: 13960870.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2018-12-17', value: 18902523.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2018-12-18', value: 18895777.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2018-12-19', value: 20968473.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2018-12-20', value: 26897008.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2018-12-21', value: 55413082.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2018-12-24', value: 15077207.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2018-12-26', value: 17970539.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2018-12-27', value: 17530977.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2018-12-28', value: 14771641.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2018-12-31', value: 15331758.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-01-02', value: 13969691.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-01-03', value: 19245411.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-01-04', value: 17035848.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-01-07', value: 16348982.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-01-08', value: 21425008.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-01-09', value: 18136000.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-01-10', value: 14259910.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-01-11', value: 15801548.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-01-14', value: 11342293.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-01-15', value: 10074386.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-01-16', value: 13411691.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-01-17', value: 15223854.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-01-18', value: 16802516.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-01-22', value: 18284771.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-01-23', value: 15109007.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-01-24', value: 12494109.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-01-25', value: 17806822.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-01-28', value: 25955718.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-01-29', value: 33789235.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-01-30', value: 27260036.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-01-31', value: 28585447.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-02-01', value: 13778392.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-02-04', value: 15818901.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-02-05', value: 14124794.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-02-06', value: 11391442.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-02-07', value: 12436168.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-02-08', value: 12011657.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-02-11', value: 9802798.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-02-12', value: 11227550.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-02-13', value: 11884803.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-02-14', value: 11190094.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-02-15', value: 15719416.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-02-19', value: 12272877.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-02-20', value: 11379006.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-02-21', value: 14680547.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-02-22', value: 12534431.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-02-25', value: 15051182.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-02-26', value: 12005571.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-02-27', value: 8962776.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-02-28', value: 15742971.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-03-01', value: 10942737.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-03-04', value: 13674737.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-03-05', value: 15749545.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-03-06', value: 13935530.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-03-07', value: 12644171.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-03-08', value: 10646710.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-03-11', value: 13627431.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-03-12', value: 12812980.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-03-13', value: 14168350.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-03-14', value: 12148349.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-03-15', value: 23715337.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-03-18', value: 12168133.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-03-19', value: 13462686.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-03-20', value: 11903104.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-03-21', value: 10920129.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-03-22', value: 25125385.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-03-25', value: 15463411.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-03-26', value: 12316901.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-03-27', value: 13290298.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-03-28', value: 20547060.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-03-29', value: 17283871.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-04-01', value: 16331140.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-04-02', value: 11408146.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-04-03', value: 15491724.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-04-04', value: 8776028.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-04-05', value: 11497780.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-04-08', value: 11680538.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-04-09', value: 10414416.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-04-10', value: 8782061.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-04-11', value: 9219930.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-04-12', value: 10847504.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-04-15', value: 7741472.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-04-16', value: 10239261.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-04-17', value: 15498037.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-04-18', value: 13189013.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-04-22', value: 11950365.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-04-23', value: 23488682.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-04-24', value: 13227084.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-04-25', value: 17425466.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-04-26', value: 16329727.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-04-29', value: 13984965.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-04-30', value: 15469002.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-05-01', value: 11627436.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-05-02', value: 14435436.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-05-03', value: 9388228.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-05-06', value: 10066145.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-05-07', value: 12963827.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-05-08', value: 12086743.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-05-09', value: 14835326.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-05-10', value: 10707335.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-05-13', value: 13759350.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-05-14', value: 12776175.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-05-15', value: 10806379.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-05-16', value: 11695064.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-05-17', value: 14436662.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-05-20', value: 20910590.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-05-21', value: 14016315.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-05-22', value: 11487448.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-05-23', value: 11707083.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-05-24', value: 8755506.00, color: 'rgba(71, 188, 235, .7)' },
	{ time: '2019-05-28', value: 3097125.00, color: 'rgba(71, 188, 235, .7)' },
];

@Component({
  selector: 'opdex-volume-chart',
  templateUrl: './volume-chart.component.html',
  styleUrls: ['./volume-chart.component.scss']
})
export class VolumeChartComponent implements OnInit {
  @ViewChild('volumeChart') container: ElementRef;
  @Input() title: string;
  @Input() valueKey: string;
  @Input() otherText: string
  @Input() theme: string;
  @Input() chartData: any;
  volumeSeries: ISeriesApi<'Histogram'>;
  chart: IChartApi;
  loading = true;

  ngOnChanges() {
    this.ngOnInit();

    if (this.chartData) {
      this.volumeSeries.setData(volume);

      this.applyChartOptions();

      if (this.loading) {
        this.chart.timeScale().fitContent()
        this.loading = false;
      }
    }
  }

  ngOnInit(): void {
    if (!this.chart) {
      this.chart = createChart('volumeChart', {
        // width: 850,
        height: 300
      });

      this.volumeSeries = this.chart.addHistogramSeries({
        priceFormat: {
          type: 'volume',
        },
        lastValueVisible: false,
        priceScaleId: '',
        base: 0,
        scaleMargins: {
          top: 0.2,
          bottom: 0,
        },
      });
    }
  }

  // Todo: copied from https://stackoverflow.com/questions/9461621/format-a-number-as-2-5k-if-a-thousand-or-more-otherwise-900
  // Rip out and write our own, using this for short term
  nFormatter(num, digits): string {
    var si = [
      { value: 1, symbol: "" },
      { value: 1E3, symbol: "k" },
      { value: 1E6, symbol: "M" },
      { value: 1E9, symbol: "G" },
      { value: 1E12, symbol: "T" },
      { value: 1E15, symbol: "P" },
      { value: 1E18, symbol: "E" }
    ];
    var rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    var i;
    for (i = si.length - 1; i > 0; i--) {
      if (num >= si[i].value) {
        break;
      }
    }
    return '$'+(num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
  }

  private applyChartOptions() {
    this.chart.applyOptions({
      grid: {
        vertLines: {
          visible: false
        },
        horzLines: {
          visible: false
        },
      },
      layout: {
        backgroundColor: 'transparent',
        textColor: '#f4f4f4',
        fontSize: 14,
        fontFamily: 'Arial',
      },
      timeScale: {
        visible: true,
        timeVisible: true,
        secondsVisible: false,
        borderVisible: false,
      },
      rightPriceScale: {
        visible: false,
        borderVisible: false
      },
      handleScroll: {
        mouseWheel: false,
        pressedMouseMove: false,
        horzTouchDrag: false,
        vertTouchDrag: false
      },
      handleScale: {
        axisPressedMouseMove: false,
        mouseWheel: false,
        pinch: false
      }
    });
  }

  onResized(event: ResizedEvent) {
    this.chart.resize(event.newWidth, 350);
    this.chart.timeScale().fitContent();
  }

  ngOnDestroy() {
    this.chart.remove();
  }
}
