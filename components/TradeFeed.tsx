"use client";

import { useEffect, useState } from "react";
import { TOKEN } from "@/lib/constants";
import { parseActivity, parseHolders, parseMint } from "@/lib/chain-data";
import { refreshVisible } from "@/lib/market-refresh";

type ReadState<T> = { status: "loading" | "unavailable" } | { status: "ready"; value: T };
type Holders = ReturnType<typeof parseHolders>;
const explorer = "https://explorer.mainnet.x1.xyz";
async function read(kind: "mint" | "activity" | "holders", signal: AbortSignal) {
  const response = await fetch(`/api/x1/?kind=${kind}`, {
    signal: AbortSignal.any([signal, AbortSignal.timeout(14000)]),
  });
  if (!response.ok) throw new Error("X1 unavailable");
  return response.json();
}

export default function TradeFeed() {
  const [mode, setMode] = useState<"activity" | "holders">("activity");
  const [request, setRequest] = useState(0);
  const [mintState, setMintState] = useState<ReadState<ReturnType<typeof parseMint>>>({ status: "loading" });
  const [activityState, setActivityState] = useState<ReadState<ReturnType<typeof parseActivity>>>({ status: "loading" });
  const [holders, setHolders] = useState<Holders>();
  const [holderError, setHolderError] = useState(false);
  const [delayed, setDelayed] = useState(false);
  const mint = mintState.status === "ready" ? mintState.value : undefined;
  const activity = activityState.status === "ready" ? activityState.value : undefined;

  useEffect(() => refreshVisible(async signal => {
    const [mintResult, activityResult] = await Promise.allSettled([
      read("mint", signal).then(account => parseMint(account, TOKEN.address)),
      read("activity", signal).then(parseActivity),
    ]);
    if (signal.aborted) return;
    setMintState(previous => mintResult.status === "fulfilled" ? { status: "ready", value: mintResult.value } :
      previous.status === "ready" ? previous : { status: "unavailable" });
    setActivityState(previous => activityResult.status === "fulfilled" ? { status: "ready", value: activityResult.value } :
      previous.status === "ready" ? previous : { status: "unavailable" });
    if (mintResult.status === "rejected" || activityResult.status === "rejected") throw new Error("X1 refresh incomplete");
    setDelayed(false);
  }, () => setDelayed(true), 45_000), [request]);

  useEffect(() => {
    if (mode !== "holders" || !mint || holders) return;
    const controller = new AbortController();
    const { signal } = controller;
    read("holders", signal).then((data: Holders) => {
      if (!data || !Number.isSafeInteger(data.slot) || !Array.isArray(data.top)) throw new Error("Invalid holder snapshot");
      if (!signal.aborted) setHolders(data);
    }).catch(() => {
      if (!signal.aborted) setHolderError(true);
    });
    return () => controller.abort();
  }, [mode, mint, holders]);

  function refresh() {
    setHolderError(false);
    setMintState({ status: "loading" });
    setActivityState({ status: "loading" });
    setHolders(undefined);
    setRequest(previous => previous + 1);
  }

  return (
    <div className="market-panel">
      <div className="market-panel__bar">
        <div role="group" aria-label="X1 data view">
          <button type="button" aria-pressed={mode === "activity"} onClick={() => setMode("activity")}>Transactions</button>
          <button type="button" aria-pressed={mode === "holders"} onClick={() => {
            if (mode !== "holders") setHolderError(false);
            setMode("holders");
          }}>Holders</button>
        </div>
        <button type="button" onClick={refresh}
          disabled={mintState.status === "loading" || activityState.status === "loading"}>Refresh</button>
      </div>
      <div className="market-panel__body">
        {delayed && (mint || activity) && <p role="status">X1 refresh delayed. Available entries are from the last successful response.</p>}
        {mint && <p className="market-panel__summary"><strong>{mint.supply} PUMP</strong> on-chain supply · slot {mint.slot}</p>}
        {!mint && <p role="status">{mintState.status === "loading" ? "Loading finalized mint supply…" : "Mint supply is unavailable."}</p>}
        {mode === "activity" && !activity && <p role="status">
          {activityState.status === "loading" ? "Loading finalized transactions…" : "Transactions are unavailable. Refresh to try again."}
        </p>}
        {mode === "activity" && activity && (
          <>
            <p>Successful transactions referencing the mint. Swap classification requires a verified XDEX pool.</p>
            {activity.length === 0 && <p>No finalized entries in the latest response.</p>}
            {activity.length > 0 && <ul className="market-panel__rows">
              {activity.map(({ signature, time }) => (
                <li key={signature}>
                  <a href={`${explorer}/tx/${signature}`} target="_blank" rel="noopener noreferrer"
                    aria-label={`View X1 transaction ${signature}`}>{signature.slice(0, 10)}…{signature.slice(-6)} ↗</a>
                  <span>{time === null ? "Time unavailable" : new Date(time * 1000).toISOString().slice(0, 19).replace("T", " ") + " UTC"}</span>
                </li>
              ))}
            </ul>}
          </>
        )}
        {mode === "holders" && mintState.status === "unavailable" &&
          <p role="status">Loading holders requires a confirmed mint account. Refresh to try again.</p>}
        {mode === "holders" && mint && (
          <>
            {!holders && <p role="status">{holderError ? "The holder snapshot is unavailable. Refresh to try again." : "Loading positive-balance token owners…"}</p>}
            {holders && <>
              <p><strong>{holders.count.toLocaleString()}</strong> positive-balance owners in the RPC response · slot {holders.slot}</p>
              <p>Balances are grouped by owner. Pool and custodial addresses may be included.</p>
              {holders.top.length > 0 && <ul className="market-panel__rows">
                {holders.top.map(({ wallet, balance }) => (
                  <li key={wallet}>
                    <a href={`${explorer}/address/${wallet}`} target="_blank" rel="noopener noreferrer"
                      aria-label={`View holder ${wallet}`}>{wallet.slice(0, 8)}…{wallet.slice(-6)} ↗</a>
                    <span>{balance} PUMP</span>
                  </li>
                ))}
              </ul>}
            </>}
          </>
        )}
      </div>
    </div>
  );
}
