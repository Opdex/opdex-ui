import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LineChartComponent } from './line-chart/line-chart.component';
import { LineChangeComponent } from './line-change/line-change.component';
import { VolumeChartComponent } from './volume-chart/volume-chart.component';

@NgModule({
  declarations: [
    LineChartComponent,
    LineChangeComponent,
    VolumeChartComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    LineChartComponent,
    LineChangeComponent,
    VolumeChartComponent
  ]
})
export class ChartsModule { }
