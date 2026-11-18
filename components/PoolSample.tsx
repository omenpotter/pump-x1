import PoolHistory from "@/components/PoolHistory";
import { poolMarket } from "@/lib/pool-market";
import { summarizePoolSample } from "@/lib/pool-sample";
import pool from "@/docs/upgrade/evidence/x1-xdex-pool.json";
import signatures from "@/docs/upgrade/evidence/x1-xdex-pool-signatures.json";
import transactions from "@/docs/upgrade/evidence/x1-xdex-pool-transactions.json";

const sample = summarizePoolSample(pool, signatures, transactions);

export default function PoolSample() {
  return sample?.trades.length ? <PoolHistory captured={poolMarket(sample)} /> : null;
}
