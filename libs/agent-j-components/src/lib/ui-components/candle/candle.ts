import { Component, computed, input, output } from '@angular/core';

export interface CandleData {
  open: number;
  high: number;
  low: number;
  close: number;
  /** A formatted timestamp or period shown in the accessible label. */
  label?: string;
}

/** Place inside an SVG. All candles in a chart should share the same price range. */
@Component({
  selector: 'g[agentjds-candle]',
  standalone: true,
  templateUrl: './candle.html',
  styleUrl: './candle.scss',
  host: {
    '[attr.role]': 'valid() ? "button" : null',
    '[attr.tabindex]': 'valid() ? 0 : null',
    '[attr.aria-label]': 'accessibleLabel()',
    '[attr.aria-pressed]': 'selected()',
    '[class.agentjds-candle]': 'true',
    '[class.agentjds-candle--rising]': 'direction() === "rising"',
    '[class.agentjds-candle--falling]': 'direction() === "falling"',
    '[class.agentjds-candle--doji]': 'direction() === "doji"',
    '[class.agentjds-candle--selected]': 'selected()',
    '(click)': 'activate()',
    '(keydown.enter)': 'activate($event)',
    '(keydown.space)': 'activate($event)',
  },
})
export class CandleComponent {
  data = input.required<CandleData>();
  priceMin = input.required<number>();
  priceMax = input.required<number>();
  /** SVG coordinates: x is the candle's center; y is the plot's top edge. */
  x = input<number>(0);
  y = input<number>(0);
  height = input<number>(200);
  width = input<number>(8);
  selected = input<boolean>(false);
  candleSelect = output<CandleData>();

  direction = computed(() =>
    this.data().close > this.data().open
      ? 'rising'
      : this.data().close < this.data().open
        ? 'falling'
        : 'doji',
  );

  valid = computed(() => {
    const { open, high, low, close } = this.data();
    return (
      [
        open,
        high,
        low,
        close,
        this.priceMin(),
        this.priceMax(),
        this.x(),
        this.y(),
        this.height(),
        this.width(),
      ].every(Number.isFinite) &&
      this.priceMax() > this.priceMin() &&
      this.height() > 0 &&
      this.width() > 0 &&
      low <= Math.min(open, close) &&
      high >= Math.max(open, close) &&
      low >= this.priceMin() &&
      high <= this.priceMax()
    );
  });

  geometry = computed(() => {
    const { open, high, low, close } = this.data();
    const scale = (price: number) =>
      this.y() +
      ((this.priceMax() - price) / (this.priceMax() - this.priceMin())) *
        this.height();
    return {
      high: scale(high),
      low: scale(low),
      top: scale(Math.max(open, close)),
      bottom: scale(Math.min(open, close)),
    };
  });

  accessibleLabel = computed(() => {
    const { label, open, high, low, close } = this.data();
    return this.valid()
      ? `${label ? label + ': ' : ''}${this.direction()}, open ${open}, high ${high}, low ${low}, close ${close}`
      : 'Invalid candle data';
  });

  activate(event?: Event): void {
    event?.preventDefault();
    if (this.valid()) this.candleSelect.emit(this.data());
  }
}
