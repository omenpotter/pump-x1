import { formatUnits } from "@/lib/chain-data";
import { summarizePoolSample } from "@/lib/pool-sample";
import pool from "@/docs/upgrade/evidence/x1-xdex-pool.json";
import signatures from "@/docs/upgrade/evidence/x1-xdex-pool-signatures.json";
import transactions from "@/docs/upgrade/evidence/x1-xdex-pool-transactions.json";

const sample = summarizePoolSample(pool, signatures, transactions);
const utc = (time: number) => new Date(time * 1000).toISOString().slice(0, 19).replace("T", " ") + " UTC";
const price = (value: number) => value.toPrecision(6);

export default function PoolSample() {
  if (!sample || sample.trades.length === 0) return null;
  const { trades, candles } = sample;
  const high = Math.max(...candles.map(candle => candle.high));
  const low = Math.min(...candles.map(candle => candle.low));
  const plot = (value: number) => high === low ? 50 : 8 + 84 * (high - value) / (high - low);
  const volume = formatUnits(sample.xntVolumeAtoms, 9);
  return (
    <section className="market-panel pool-sample" aria-labelledby="pool-sample-title">
      <header className="market-panel__bar">
        <h3 id="pool-sample-title">Verified pool activity</h3>
        <span className="market-status">Historical sample</span>
      </header>
      <div className="market-panel__body">
        <p>{trades.length} verified swaps · <strong>{volume} XNT</strong> sample volume</p>
        <p>{utc(trades[trades.length - 1].time)} to {utc(trades[0].time)}. Only captured swaps are included.</p>
        {candles.length > 0 && <figure>
          <figcaption>5-minute sample candles · XNT per PUMP</figcaption>
          <div className="pool-candles" aria-hidden="true">
            {candles.map(candle => {
              const color = candle.close >= candle.open ? "var(--cyan)" : "#ff6776";
              const top = plot(Math.max(candle.open, candle.close));
              return <div className="pool-candle" key={candle.time} style={{ color }}>
                <span className="pool-candle__wick" style={{ top: `${plot(candle.high)}%`, height: `${plot(candle.low) - plot(candle.high)}%` }} />
                <span className="pool-candle__body" style={{ top: `${top}%`, height: `${plot(Math.min(candle.open, candle.close)) - top}%` }} />
              </div>;
            })}
          </div>
          <div className="pool-table" tabIndex={0} role="region" aria-label="Sample candle values">
            <table>
              <thead><tr><th scope="col">UTC interval</th><th scope="col">Open</th><th scope="col">High</th><th scope="col">Low</th><th scope="col">Close</th><th scope="col">XNT volume</th></tr></thead>
              <tbody>{candles.map(candle => <tr key={candle.time}>
                <th scope="row">{utc(candle.time)}</th>
                <td>{price(candle.open)}</td><td>{price(candle.high)}</td><td>{price(candle.low)}</td><td>{price(candle.close)}</td>
                <td>{formatUnits(candle.xntAtoms, 9)}</td>
              </tr>)}</tbody>
            </table>
          </div>
        </figure>}
        <div className="pool-table" tabIndex={0} role="region" aria-label="Verified pool swaps">
          <table>
            <thead><tr><th scope="col">Transaction</th><th scope="col">Side</th><th scope="col">PUMP</th><th scope="col">XNT</th><th scope="col">XNT per PUMP</th><th scope="col">Time</th></tr></thead>
            <tbody>{trades.map(trade => <tr key={trade.signature}>
              <th scope="row"><a href={`https://explorer.mainnet.x1.xyz/tx/${trade.signature}`} target="_blank" rel="noopener noreferrer">{trade.signature.slice(0, 8)}… ↗</a></th>
              <td>{trade.side}</td><td>{formatUnits(trade.pumpAtoms, 9)}</td><td>{formatUnits(trade.xntAtoms, 9)}</td>
              <td>{price(trade.price)}</td><td>{utc(trade.time)}</td>
            </tr>)}</tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
