import { formatUnits } from "@/lib/chain-data";
import { buildPoolCandles, CANDLE_TIMEFRAMES, summarizePoolSample } from "@/lib/pool-sample";
import HistoricalCandles from "@/components/HistoricalCandles";
import pool from "@/docs/upgrade/evidence/x1-xdex-pool.json";
import signatures from "@/docs/upgrade/evidence/x1-xdex-pool-signatures.json";
import transactions from "@/docs/upgrade/evidence/x1-xdex-pool-transactions.json";

const sample = summarizePoolSample(pool, signatures, transactions);
const series = CANDLE_TIMEFRAMES.map(({ label, seconds }) => ({
  label, seconds,
  candles: buildPoolCandles(sample?.trades ?? [], seconds).map(({ xntAtoms, ...candle }) => ({
    ...candle, volume: Number(xntAtoms) / 1e9, volumeText: formatUnits(xntAtoms, 9),
  })),
}));
const utc = (time: number) => new Date(time * 1000).toISOString().slice(0, 19).replace("T", " ") + " UTC";
const price = (value: number) => value.toPrecision(6);

export default function PoolSample() {
  if (!sample || sample.trades.length === 0) return null;
  const { trades } = sample;
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
        <HistoricalCandles series={series} />
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
