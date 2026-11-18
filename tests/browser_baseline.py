import argparse
import json
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlsplit

from playwright.sync_api import expect, sync_playwright


WIDTHS = (320, 360, 390, 480, 768, 1024, 1280, 1440, 1920, 2560)


def capture(browser, url, width, output, offline_providers, replay):
    context = browser.new_context(
        viewport={"width": width, "height": 900},
        device_scale_factor=1,
        has_touch=width < 768,
        reduced_motion="reduce",
    )
    if offline_providers or replay:
        target = urlsplit(url)

        def limit_to_target(route):
            request = urlsplit(route.request.url)
            local = (request.scheme, request.netloc) == (target.scheme, target.netloc)
            if replay and local and request.path.rstrip("/") == "/api/xdex":
                route.fulfill(json=replay["quote"])
            elif replay and request.hostname == "rpc.mainnet.x1.xyz":
                cors = {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "content-type",
                    "Access-Control-Allow-Methods": "POST, OPTIONS",
                }
                if route.request.method == "OPTIONS":
                    route.fulfill(status=204, headers=cors)
                elif route.request.method == "POST" and (route.request.post_data_json or {}).get("method") == "getAccountInfo":
                    route.fulfill(json=replay["mint"], headers=cors)
                else:
                    route.abort()
            elif local:
                route.continue_()
            else:
                route.abort()

        context.route("**/*", limit_to_target)
    context.add_init_script("""
      window.pumpVitals = {};
      try {
        new PerformanceObserver(list => {
          const entries = list.getEntries();
          window.pumpVitals.lcpMs = entries.at(-1)?.startTime;
        }).observe({type: 'largest-contentful-paint', buffered: true});
      } catch {}
    """)
    page = context.new_page()
    if replay:
        observed = replay["quote"]["data"][0]["observedTimestamp"]
        page.clock.set_fixed_time(datetime.fromtimestamp(observed / 1000 + 2, tz=timezone.utc))
    requests = Counter()
    errors = []
    page.on("request", lambda request: requests.update([(request.method, urlsplit(request.url).hostname or "local")]))
    page.on("pageerror", lambda error: errors.append(str(error)))
    try:
        response = page.goto(url, wait_until="load", timeout=20000)
        assert response and response.ok, f"Unexpected navigation response at {width}px"
        expect(page.get_by_role("heading", level=1)).to_be_visible()
        expect(page.get_by_role("navigation", name="Main")).to_be_visible()
        page.keyboard.press("Tab")
        expect(page.get_by_role("link", name="Skip to content")).to_be_focused()
        page.keyboard.press("Enter")
        expect(page.locator("main")).to_be_focused()
        expect(page.get_by_role("heading", name="PUMP / XNT")).to_be_visible()
        expect(page.get_by_role("heading", name="Verified pool activity")).to_be_visible()
        expect(page.get_by_role("region", name="Verified pool swaps").get_by_role("row")).to_have_count(10)
        expect(page.get_by_role("region", name="Sample candle values").get_by_role("row")).to_have_count(3)
        if replay:
            expect(page.get_by_text("XDEX · delayed", exact=True)).to_be_visible()
            expect(page.get_by_text("18444229684.271747299 PUMP", exact=True)).to_be_visible()
            expect(page.get_by_role("link", name="XDEX selected pool")).to_have_attribute(
                "href", "https://explorer.mainnet.x1.xyz/address/" + replay["quote"]["data"][0]["selected_pool"]
            )
        elif offline_providers:
            expect(page.get_by_text("Market data unavailable", exact=True)).to_be_visible()
        containment = page.evaluate("document.documentElement.scrollWidth <= innerWidth")
        assert containment, f"Horizontal page overflow at {width}px"
        holders = page.get_by_role("button", name="Holders", exact=True)
        holders.click()
        expect(holders).to_have_attribute("aria-pressed", "true")
        transactions = page.get_by_role("button", name="Transactions", exact=True)
        transactions.click()
        expect(transactions).to_have_attribute("aria-pressed", "true")
        page.evaluate("scrollTo(0, 0)")
        page.screenshot(path=output / f"{width}.png", full_page=True, animations="disabled")
        timings = None if replay else page.evaluate("""() => {
          const entry = performance.getEntriesByType('navigation')[0];
          return {
            ...window.pumpVitals,
            responseStartMs: entry.responseStart,
            domContentLoadedMs: entry.domContentLoadedEventEnd,
            loadMs: entry.loadEventEnd,
            documentBytes: entry.transferSize,
            resourceEntries: performance.getEntriesByType('resource').length
          };
        }""")
        assert not errors, f"Browser errors at {width}px: {errors}"
        return {
            "width": width,
            "offline_providers": offline_providers,
            "replayed_market_evidence": bool(replay),
            "timings": timings,
            "requests": [{"method": method, "host": host, "count": count} for (method, host), count in sorted(requests.items())],
            "headers": {name: response.headers.get(name) for name in (
                "content-security-policy", "x-content-type-options", "x-frame-options",
                "strict-transport-security", "referrer-policy", "permissions-policy",
            )},
        }
    finally:
        context.close()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("url")
    parser.add_argument("--output", type=Path, default=Path("docs/upgrade/evidence/browser-development"))
    parser.add_argument("--offline-providers", action="store_true", help="Verify layout while external provider requests are blocked")
    parser.add_argument("--replay-market-evidence", action="store_true", help="Replay captured, time-stamped X1 and XDEX responses")
    args = parser.parse_args()
    replay = None
    if args.replay_market_evidence:
        evidence = Path(__file__).resolve().parents[1] / "docs" / "upgrade" / "evidence"
        replay = {
            "quote": json.loads((evidence / "xdex-paired-quote.json").read_text(encoding="utf-8-sig")),
            "mint": json.loads((evidence / "x1-mint-finalized.json").read_text(encoding="utf-8-sig")),
        }
    args.output.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(channel="msedge")
        try:
            results = [capture(browser, args.url, width, args.output, args.offline_providers, replay) for width in WIDTHS]
        finally:
            browser.close()
    (args.output / "results.json").write_text(json.dumps(results, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
