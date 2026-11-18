"use client";

import { useEffect, useRef, useState } from "react";
import { formatTokenPrice } from "@/lib/market-format";
import type { KeyboardEvent, PointerEvent } from "react";

type Candle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  partial: boolean;
  volume: number;
  volumeText: string;
};

export type Series = { label: string; seconds: number; candles: Candle[] };
type Cursor = { time: number; y?: number };
const height = 336;
const priceBottom = 221;
const volumeBottom = 299;
const padding = 12;
const utc = (time: number) => new Date(time * 1000).toISOString().slice(0, 16).replace("T", " ");
const price = formatTokenPrice;

function plotRight(width: number) {
  return width - (width < 480 ? 91 : 116);
}

export default function HistoricalCandles({ series }: { series: Series[] }) {
  const [timeframe, setTimeframe] = useState("5m");
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<number | null>(null);
  const [cursor, setCursor] = useState<Cursor | null>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const container = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const selected = series.find(entry => entry.label === timeframe) ?? series[0];
  const { candles, seconds } = selected;
  const first = candles[0]?.time ?? 0;
  const last = candles[candles.length - 1]?.time ?? first;
  const baseStart = first - seconds / 2;
  const baseEnd = last + seconds * 1.5;
  const span = Math.max(seconds * 2, (baseEnd - baseStart) / zoom);
  const start = Math.max(baseStart, Math.min(baseEnd - span, (center ?? last + seconds / 2) - span / 2));
  const end = start + span;
  const active = candles.find(candle => candle.time === cursor?.time);

  useEffect(() => {
    const element = container.current;
    if (!element) return;
    const resize = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    resize.observe(element);
    return () => resize.disconnect();
  }, []);

  useEffect(() => {
    const element = canvas.current;
    if (!element || !width || !candles.length) return;
    const context = element.getContext("2d");
    if (!context) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    element.width = Math.round(width * ratio);
    element.height = height * ratio;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);

    const right = plotRight(width);
    const plotWidth = right - padding;
    const visible = candles.filter(candle => candle.time + seconds / 2 >= start && candle.time + seconds / 2 <= end);
    const range = visible.length ? visible : candles;
    const low = Math.min(...range.map(candle => candle.low));
    const high = Math.max(...range.map(candle => candle.high));
    const margin = Math.max((high - low) * .12, high * .003);
    const maximum = high + margin;
    const minimum = low - margin;
    const y = (value: number) => 22 + (maximum - value) / (maximum - minimum) * (priceBottom - 22);
    const x = (time: number) => padding + (time - start) / span * plotWidth;
    const body = Math.min(28, Math.max(6, seconds / span * plotWidth * .58));
    const maxVolume = Math.max(...range.map(candle => candle.volume));

    context.fillStyle = "#061321";
    context.fillRect(0, 0, width, height);
    context.font = "11px ui-monospace, monospace";
    const line = (x1: number, y1: number, x2: number, y2: number) => {
      context.beginPath();
      context.moveTo(x1, y1);
      context.lineTo(x2, y2);
      context.stroke();
    };
    context.strokeStyle = "#1a3045";
    context.fillStyle = "#a0bad1";
    for (let index = 0; index <= 4; index++) {
      const level = maximum - index / 4 * (maximum - minimum);
      const position = y(level);
      line(padding, position, right, position);
      context.fillText(price(level), right + 7, position + 4, width - right - 10);
    }
    line(padding, volumeBottom + 5, right, volumeBottom + 5);
    context.fillText("XNT volume", padding + 2, 245);
    context.fillText(price(maxVolume), right + 7, 261, width - right - 10);
    const ticks = width < 450 ? 2 : 3;
    for (let index = 0; index < ticks; index++) {
      const at = index / (ticks - 1);
      const position = padding + at * plotWidth;
      line(position, 22, position, volumeBottom + 5);
      const label = utc(start + at * span * (1 - 0.00001)).slice(width < 450 ? 11 : 5);
      context.fillText(label, Math.min(position, right - context.measureText(label).width), 324);
    }

    context.save();
    context.beginPath();
    context.rect(padding, 12, plotWidth, volumeBottom - 10);
    context.clip();
    for (const candle of visible) {
      const position = x(candle.time + seconds / 2);
      const color = candle.close >= candle.open ? "#36debe" : "#ff7785";
      context.strokeStyle = color;
      context.fillStyle = color;
      line(position, y(candle.high), position, y(candle.low));
      const top = y(Math.max(candle.open, candle.close));
      const size = Math.max(2, Math.abs(y(candle.open) - y(candle.close)));
      if (candle.partial) context.strokeRect(position - body / 2, top, body, size);
      else context.fillRect(position - body / 2, top, body, size);
      context.globalAlpha = .48;
      const volume = candle.volume / maxVolume * 42;
      context.fillRect(position - body / 2, volumeBottom - volume, body, volume);
      context.globalAlpha = 1;
    }
    if (active && cursor) {
      const at = x(active.time + seconds / 2);
      const level = cursor.y ?? y(active.close);
      context.strokeStyle = "#819cb5";
      context.setLineDash([4, 4]);
      line(at, 14, at, volumeBottom);
      if (level >= 14 && level <= priceBottom) line(padding, level, right, level);
    }
    context.restore();
  }, [active, candles, cursor, end, seconds, span, start, width]);

  function move(event: PointerEvent<HTMLCanvasElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const right = plotRight(bounds.width);
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    const plotWidth = right - padding;
    if (x < padding || x > right || y < 12 || y > volumeBottom) {
      setCursor(null);
      return;
    }
    const time = start + (x - padding) / plotWidth * span;
    const tolerance = Math.max(seconds * .35, 13 * span / plotWidth);
    const nearby = candles.filter(candle => candle.time + seconds / 2 >= start && candle.time + seconds / 2 <= end)
      .reduce<Candle | undefined>((closest, candle) => !closest ||
      Math.abs(candle.time + seconds / 2 - time) < Math.abs(closest.time + seconds / 2 - time) ? candle : closest, undefined);
    setCursor(nearby && Math.abs(nearby.time + seconds / 2 - time) <= tolerance ? { time: nearby.time, y } : null);
  }

  function selectWithKeyboard(event: KeyboardEvent<HTMLCanvasElement>) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight" && event.key !== "Escape") return;
    event.preventDefault();
    if (event.key === "Escape") {
      setCursor(null);
      return;
    }
    const index = active ? candles.indexOf(active) + (event.key === "ArrowLeft" ? -1 : 1) :
      event.key === "ArrowLeft" ? candles.length - 1 : 0;
    const candle = candles[Math.max(0, Math.min(candles.length - 1, index))];
    setCenter(candle.time + seconds / 2);
    setCursor({ time: candle.time });
  }

  function changeFrame(label: string) {
    setTimeframe(label);
    setZoom(1);
    setCenter(null);
    setCursor(null);
  }

  return (
    <section className="history-chart" aria-labelledby="history-title">
      <h4 id="history-title">Price history</h4>
      <p>Incomplete history · XNT per PUMP · UTC. Hollow candles mark capture boundaries.</p>
      <div className="history-chart__controls">
        <div role="group" aria-label="Candle timeframe">
          {series.map(({ label }) => (
            <button key={label} type="button" aria-pressed={timeframe === label} onClick={() => changeFrame(label)}>{label}</button>
          ))}
        </div>
        <div role="group" aria-label="Chart zoom">
          <button type="button" aria-label="Zoom in" disabled={candles.length < 2 || zoom >= 16} onClick={() => setZoom(zoom * 2)}>+</button>
          <button type="button" aria-label="Zoom out" disabled={zoom === 1} onClick={() => setZoom(zoom / 2)}>−</button>
          <button type="button" disabled={zoom === 1 && center === null} onClick={() => { setZoom(1); setCenter(null); setCursor(null); }}>Reset</button>
        </div>
      </div>
      <div ref={container} className="history-chart__plot">
        {candles.length ? <>
          <canvas ref={canvas} tabIndex={0} role="img" aria-label={`${timeframe} price and volume chart. Use arrow keys to inspect candles.`}
            onPointerMove={move} onPointerDown={move} onPointerLeave={() => setCursor(null)} onKeyDown={selectWithKeyboard} />
          <div className="history-chart__tooltip" role="status" aria-label="Candle tooltip">
            {active ? <>
              <strong>{utc(active.time)} UTC{active.partial ? " · Partial" : ""}</strong>
              <span>O {price(active.open)}</span><span>H {price(active.high)}</span>
              <span>L {price(active.low)}</span><span>C {price(active.close)}</span>
              <span>Vol {active.volumeText} XNT</span>
            </> : <span>Point to a candle or use the arrow keys to inspect OHLC and volume.</span>}
          </div>
        </> : <p className="history-chart__empty" role="status">{timeframe} history unavailable. The verified capture does not contain enough data for this interval.</p>}
      </div>
      {candles.length > 0 && <details className="history-chart__values">
        <summary>View candle values</summary>
        <div className="pool-table" tabIndex={0} role="region" aria-label="Sample candle values">
          <table>
            <thead><tr><th scope="col">UTC interval</th><th scope="col">Open</th><th scope="col">High</th><th scope="col">Low</th><th scope="col">Close</th><th scope="col">XNT volume</th></tr></thead>
            <tbody>{candles.map(candle => <tr key={candle.time}>
              <th scope="row">{utc(candle.time)}{candle.partial ? " · Partial" : ""}</th>
              <td>{price(candle.open)}</td><td>{price(candle.high)}</td><td>{price(candle.low)}</td><td>{price(candle.close)}</td><td>{candle.volumeText}</td>
            </tr>)}</tbody>
          </table>
        </div>
      </details>}
    </section>
  );
}
