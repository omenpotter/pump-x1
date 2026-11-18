"use client";

import { useEffect, useState } from "react";
import { TOKEN } from "@/lib/constants";
import { parseActivity, parseHolders, parseMint, readX1, TOKEN_2022 } from "@/lib/chain-data";

type ReadState<T> = { status: "loading" | "unavailable" } | { status: "ready"; value: T };
type Holders = ReturnType<typeof parseHolders>;
const explorer = "https://explorer.mainnet.x1.xyz";
const finalized = { commitment: "finalized" };

export default function TradeFeed() {
  const [mode, setMode] = useState<"activity" | "holders">("activity");
  const [request, setRequest] = useState(0);
  const [mintState, setMintState] = useState<ReadState<ReturnType<typeof parseMint>>>({ status: "loading" });
  const [activityState, setActivityState] = useState<ReadState<ReturnType<typeof parseActivity>>>({ status: "loading" });
  const [holders, setHolders] = useState<Holders>();
  const [holderError, setHolderError] = useState(false);
  const mint = mintState.status === "ready" ? mintState.value : undefined;
  const activity = activityState.status === "ready" ? activityState.value : undefined;

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    readX1("getAccountInfo", [TOKEN.address, { ...finalized, encoding: "jsonParsed" }], signal).then(account => {
      if (!signal.aborted) setMintState({ status: "ready", value: parseMint(account, TOKEN.address) });
    }).catch(() => {
      if (!signal.aborted) setMintState({ status: "unavailable" });
    });
    readX1("getSignaturesForAddress", [TOKEN.address, { ...finalized, limit: 25 }], signal).then(signatures => {
      if (!signal.aborted) setActivityState({ status: "ready", value: parseActivity(signatures) });
    }).catch(() => {
      if (!signal.aborted) setActivityState({ status: "unavailable" });
    });
    return () => controller.abort();
  }, [request]);

  useEffect(() => {
    if (mode !== "holders" || !mint || holders) return;
    const controller = new AbortController();
    const { signal } = controller;
    readX1("getProgramAccounts", [TOKEN_2022, {
      ...finalized,
      encoding: "jsonParsed",
      withContext: true,
      minContextSlot: mint.slot,
      filters: [{ memcmp: { offset: 0, bytes: TOKEN.address } }],
    }], signal).then(data => {
      if (!signal.aborted) setHolders(parseHolders(data, TOKEN.address, mint.decimals));
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
