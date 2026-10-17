import { Component } from '@angular/core';
import { render, fireEvent } from '@testing-library/angular';
import { describe, expect, it, vi } from 'vitest';
import { CandleComponent } from './candle';

@Component({
  standalone: true,
  imports: [CandleComponent],
  template: `<svg>
    <g
      agentjds-candle
      [data]="data"
      [priceMin]="0"
      [priceMax]="100"
      [x]="20"
      [height]="200"
      (candleSelect)="select($event)"
    ></g>
  </svg>`,
})
class HostComponent {
  data = { open: 40, close: 60, low: 20, high: 80 };
  select = vi.fn();
}

describe('CandleComponent', () => {
  it('maps OHLC values to SVG coordinates on the shared price scale', async () => {
    const { container } = await render(HostComponent);
    const wick = container.querySelector('line')!;
    const body = container.querySelector('.agentjds-candle__body')!;
    expect(wick.namespaceURI).toBe('http://www.w3.org/2000/svg');
    expect(wick.getAttribute('y1')).toBe('40');
    expect(wick.getAttribute('y2')).toBe('160');
    expect(body.getAttribute('y')).toBe('80');
    expect(body.getAttribute('height')).toBe('40');
  });

  it('renders falling candles and a visible doji line', async () => {
    const { fixture, container } = await render(HostComponent);
    fixture.componentInstance.data = { open: 60, close: 40, low: 20, high: 80 };
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    expect(
      container
        .querySelector('g')!
        .classList.contains('agentjds-candle--falling'),
    ).toBe(true);
    fixture.componentInstance.data = { open: 40, close: 40, low: 20, high: 80 };
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    expect(container.querySelector('.agentjds-candle__body')!.tagName).toBe(
      'line',
    );
  });

  it('supports pointer and keyboard selection with an OHLC label', async () => {
    const { fixture, getByRole } = await render(HostComponent);
    const candle = getByRole('button', {
      name: /open 40, high 80, low 20, close 60/,
    });
    fireEvent.click(candle);
    fireEvent.keyDown(candle, { key: 'Enter' });
    fireEvent.keyDown(candle, { key: ' ' });
    expect(fixture.componentInstance.select).toHaveBeenCalledTimes(3);
    expect(fixture.componentInstance.select).toHaveBeenLastCalledWith(
      fixture.componentInstance.data,
    );
  });

  it('omits invalid OHLC geometry and selection', async () => {
    const { fixture, container } = await render(HostComponent);
    fixture.componentInstance.data = { open: 40, close: 60, low: 20, high: 50 };
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    expect(container.querySelector('rect')).toBeNull();
    expect(container.querySelector('g')!.getAttribute('tabindex')).toBeNull();
    fireEvent.click(container.querySelector('g')!);
    expect(fixture.componentInstance.select).not.toHaveBeenCalled();
  });
});
