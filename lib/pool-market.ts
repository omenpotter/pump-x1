import { buildPoolCandles, CANDLE_TIMEFRAMES, summarizePoolSample } from "@/lib/pool-sample";
import { formatUnits } from "@/lib/chain-data";

export function poolMarket(sample: NonNullable<ReturnType<typeof summarizePoolSample>>) {
  return {
    volume: formatUnits(sample.xntVolumeAtoms, 9),
    trades: sample.trades.map(({ signature, time, side, pumpAtoms, xntAtoms, price }) => ({
      signature, time, side, price, pump: formatUnits(pumpAtoms, 9), xnt: formatUnits(xntAtoms, 9),
    })),
    series: CANDLE_TIMEFRAMES.map(({ label, seconds }) => ({
      label, seconds,
      candles: buildPoolCandles(sample.trades, seconds).map(({ xntAtoms, ...candle }) => ({
        ...candle, volume: Number(xntAtoms) / 1e9, volumeText: formatUnits(xntAtoms, 9),
      })),
    })),
  };
}

export type PoolMarket = ReturnType<typeof poolMarket>;
