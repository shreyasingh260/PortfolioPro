import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, ViewChild } from '@angular/core';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const PALETTE = ['#0B5D56', '#C2851C', '#4F6D9A', '#A5483A', '#6E8B3D', '#7A5C8E'];

/** Small wrapper around Chart.js: one dataset, either a doughnut or a line. */
@Component({
  selector: 'app-chart',
  standalone: true,
  template: `<canvas #cv></canvas>`,
  styles: [`:host { display: block; position: relative; height: 100%; }`]
})
export class ChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() type: 'doughnut' | 'line' = 'line';
  @Input() labels: string[] = [];
  @Input() values: number[] = [];
  @Input() label = '';
  @ViewChild('cv') canvas!: ElementRef<HTMLCanvasElement>;
  private chart?: Chart;

  ngAfterViewInit() { this.draw(); }
  ngOnChanges() { if (this.chart) this.draw(); }
  ngOnDestroy() { this.chart?.destroy(); }

  private draw() {
    this.chart?.destroy();
    const isLine = this.type === 'line';
    const dataset: any = isLine
      ? { label: this.label, data: this.values, borderColor: PALETTE[0], backgroundColor: 'rgba(11,93,86,0.08)',
          fill: true, tension: 0.25, pointRadius: 3, borderWidth: 2 }
      : { label: this.label, data: this.values, backgroundColor: PALETTE, borderColor: '#fff', borderWidth: 2 };
    const options: any = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: !isLine, position: 'bottom' } },
      ...(isLine ? { scales: { y: { ticks: { callback: (v: number) => '₹' + Number(v).toLocaleString('en-IN') } } } } : { cutout: '62%' })
    };
    this.chart = new Chart(this.canvas.nativeElement, {
      type: this.type, data: { labels: this.labels, datasets: [dataset] }, options
    });
  }
}
