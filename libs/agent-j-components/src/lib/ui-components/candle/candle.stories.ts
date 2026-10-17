import { Meta, StoryObj } from '@storybook/angular';
import { CandleComponent, CandleData } from './candle';

const meta: Meta<CandleComponent> = {
  component: CandleComponent,
  title: 'UI Components/Candle',
  tags: ['autodocs'],
  args: {
    data: {
      open: 62000,
      high: 65000,
      low: 61000,
      close: 64000,
      label: 'BTC/USD · 1h',
    },
    priceMin: 60000,
    priceMax: 66000,
    x: 80,
    y: 20,
    height: 200,
    width: 16,
    selected: false,
  },
  render: (args) => ({
    props: args,
    template: `
    <svg viewBox="0 0 160 240" style="width:160px" aria-label="Candle preview">
      <g agentjds-candle [data]="data" [priceMin]="priceMin" [priceMax]="priceMax"
        [x]="x" [y]="y" [height]="height" [width]="width" [selected]="selected"></g>
    </svg>`,
  }),
};
export default meta;
type Story = StoryObj<CandleComponent>;
export const Rising: Story = {};
export const Falling: Story = {
  args: { data: { open: 64000, high: 65000, low: 61000, close: 62000 } },
};
export const Doji: Story = {
  args: { data: { open: 63000, high: 65000, low: 61000, close: 63000 } },
};

const candles: CandleData[] = [
  { open: 62000, high: 63200, low: 61200, close: 62800 },
  { open: 62800, high: 63800, low: 62300, close: 63500 },
  { open: 63500, high: 64200, low: 62100, close: 62500 },
  { open: 62500, high: 63100, low: 61800, close: 62500 },
  { open: 62500, high: 64400, low: 62200, close: 64000 },
  { open: 64000, high: 65300, low: 63500, close: 65000 },
  { open: 65000, high: 65500, low: 63900, close: 64300 },
  { open: 64300, high: 65800, low: 64000, close: 65400 },
].map((candle, index) => ({
  ...candle,
  label: `BTC/USD · ${index + 1}:00 UTC`,
}));

export const CryptoGraph: Story = {
  render: () => ({
    props: {
      candles,
      active: candles[0],
      select(candle: CandleData) {
        this['active'] = candle;
      },
    },
    template: `
      <div style="max-width:720px;padding:24px;background:#0f172a;color:#e2e8f0;border-radius:12px;font-family:system-ui;--agentj-candle-rising:#34d399;--agentj-candle-falling:#fb7185">
        <strong>BTC / USD · 1h</strong>
        <p>Illustrative data · Select a candle to inspect OHLC</p>
        <svg viewBox="0 0 640 280" style="width:100%;display:block" aria-label="Sample Bitcoin hourly candlestick chart">
          @for (price of [66000, 64000, 62000, 60000]; track price) {
            <line x1="20" x2="550" [attr.y1]="20 + (66000-price)/6000*240" [attr.y2]="20 + (66000-price)/6000*240" stroke="#334155" />
            <text x="560" [attr.y]="24 + (66000-price)/6000*240" fill="#94a3b8" font-size="12">{{ price }}</text>
          }
          @for (candle of candles; track $index) {
            <g agentjds-candle [data]="candle" [priceMin]="60000" [priceMax]="66000"
              [x]="55 + $index * 65" [y]="20" [height]="240" [width]="20"
              [selected]="active === candle" (candleSelect)="select($event)"></g>
          }
        </svg>
        <p aria-live="polite">{{ active.label }} · O {{ active.open }} · H {{ active.high }} · L {{ active.low }} · C {{ active.close }}</p>
      </div>`,
  }),
};
