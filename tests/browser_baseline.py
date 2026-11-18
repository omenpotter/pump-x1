import argparse
import json
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import parse_qs, urljoin, urlsplit

from playwright.sync_api import expect, sync_playwright


WIDTHS = (320, 360, 390, 480, 768, 1024, 1280, 1440, 1920, 2560)
SCREENSHOT_WIDTHS = (390, 1440)


def verify_page(page, route, heading, width, output):
    expect(page.get_by_role("heading", name=heading, level=1)).to_be_visible()
    expect(page.get_by_role("contentinfo")).to_be_visible()
    assert page.evaluate("document.documentElement.scrollWidth <= innerWidth"), f"Overflow on {route} at {width}px"
    if width in SCREENSHOT_WIDTHS:
        page.evaluate("scrollTo(0, 0)")
        page.screenshot(path=output / f"{route}-{width}.png", full_page=True, animations="disabled")


def verify_globe(playwright, url, output):
    browser = playwright.chromium.launch(channel="msedge", args=["--use-gl=angle", "--use-angle=swiftshader"])
    try:
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        page.route("https://**/*", lambda route: route.abort())
        page.add_init_script("""
          window.pumpGlobeDraws = 0;
          window.pumpArtworkDraws = 0;
          const drawImage = CanvasRenderingContext2D.prototype.drawImage;
          CanvasRenderingContext2D.prototype.drawImage = function (image, ...args) {
            if (this.canvas.width === 2048 && this.canvas.height === 1024 && image.src?.endsWith('/pump-token.png')) {
              window.pumpArtworkDraws++;
            }
            return drawImage.call(this, image, ...args);
          };
          for (const ctor of [window.WebGLRenderingContext, window.WebGL2RenderingContext]) {
            if (!ctor) continue;
            for (const name of ['drawArrays', 'drawElements']) {
              const original = ctor.prototype[name];
              ctor.prototype[name] = function (...args) {
                window.pumpGlobeDraws++;
                return original.apply(this, args);
              };
            }
          }
        """)
        page.goto(url)
        globe = page.locator(".orb-visual")
        expect(globe).to_have_attribute("data-globe", "ready", timeout=15000)
        assert page.evaluate("window.pumpArtworkDraws") == 1, "The atlas must draw the original artwork once"
        draws = page.evaluate("window.pumpGlobeDraws")
        page.wait_for_function("previous => window.pumpGlobeDraws > previous", arg=draws)
        globe.screenshot(path=output / "globe.png")

        page.emulate_media(reduced_motion="reduce")
        page.wait_for_timeout(350)
        settled = page.evaluate("window.pumpGlobeDraws")
        page.wait_for_timeout(300)
        assert page.evaluate("window.pumpGlobeDraws") == settled, "Reduced motion should stop the WebGL render loop"
        page.goto(urljoin(url, "/#market"))
        expect(page).to_have_url(urljoin(url, "/market/"))
        expect(page.get_by_role("heading", name="Price terminal", level=1)).to_be_visible()
    finally:
        browser.close()


def capture(browser, url, width, output, offline_providers, replay):
    context = browser.new_context(
        viewport={"width": width, "height": 900},
        device_scale_factor=1,
        has_touch=width < 768,
        reduced_motion="reduce",
        permissions=["clipboard-read", "clipboard-write"],
    )
    quote_available = True
    if offline_providers or replay:
        target = urlsplit(url)

        def limit_to_target(route):
            request = urlsplit(route.request.url)
            local = (request.scheme, request.netloc) == (target.scheme, target.netloc)
            if replay and local and request.path.rstrip("/") == "/api/xdex":
                if quote_available:
                    route.fulfill(json=replay["quote"])
                else:
                    route.fulfill(status=502, json={"error": "Quote service unavailable"})
            elif replay and local and request.path.rstrip("/") == "/api/x1":
                if parse_qs(request.query).get("kind") == ["mint"]:
                    route.fulfill(json=replay["mint"]["result"])
                else:
                    route.fulfill(status=502, json={"error": "X1 data unavailable"})
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
        navigation = page.get_by_role("navigation", name="Main")
        expect(navigation).to_be_visible()
        page.keyboard.press("Tab")
        expect(page.get_by_role("link", name="Skip to content")).to_be_focused()
        page.keyboard.press("Enter")
        expect(page.locator("main")).to_be_focused()
        verify_page(page, "home", "PUMP IT ON X1", width, output)
        expect(page.get_by_role("navigation", name="Explore PUMP")).to_be_visible()
        expect(navigation.locator("li a")).to_have_text(["Home", "Market", "Token", "Community"], use_inner_text=False)
        expect(navigation.get_by_role("link", name="Home", exact=True)).to_have_attribute("aria-current", "page")
        page.evaluate("window.pumpNavigationDocument = true")

        market = navigation.get_by_role("link", name="Market", exact=True)
        market.click()
        expect(page).to_have_url(urljoin(url, "/market/"))
        expect(market).to_have_attribute("aria-current", "page")
        verify_page(page, "market", "Price terminal", width, output)
        expect(page.get_by_role("heading", name="PUMP / XNT")).to_be_visible()
        expect(page.get_by_role("heading", name="Verified pool activity")).to_be_visible()
        expect(page.get_by_role("region", name="Verified pool swaps").get_by_role("row")).to_have_count(10)
        chart = page.get_by_role("img", name="5m price and volume chart")
        expect(chart).to_be_visible()
        chart.press("ArrowLeft")
        expect(page.get_by_role("status", name="Candle tooltip")).to_contain_text("Vol")
        page.get_by_role("button", name="Zoom in").click()
        expect(page.get_by_role("button", name="Zoom out")).to_be_enabled()
        page.get_by_role("button", name="Reset", exact=True).click()
        frames = page.get_by_role("group", name="Candle timeframe")
        expect(frames.get_by_role("button")).to_have_text(["1m", "5m", "15m", "1H", "4H", "1D"])
        frames.get_by_role("button", name="1D", exact=True).click()
        expect(page.get_by_text("1D history unavailable", exact=False)).to_be_visible()
        frames.get_by_role("button", name="5m", exact=True).click()
        page.get_by_text("View candle values", exact=True).click()
        expect(page.get_by_role("region", name="Sample candle values").get_by_role("row")).to_have_count(3)
        if replay:
            expect(page.get_by_text("XDEX · delayed", exact=True)).to_be_visible()
            expect(page.get_by_text("$0.000000076637409", exact=True)).to_be_visible()
            expect(page.get_by_text("18444229684.271747299 PUMP", exact=True)).to_be_visible()
            expect(page.get_by_role("link", name="XDEX selected pool")).to_have_attribute(
                "href", "https://explorer.mainnet.x1.xyz/address/" + replay["quote"]["data"][0]["selected_pool"]
            )
            if width == 390:
                quote_available = False
                page.evaluate("window.dispatchEvent(new Event('online'))")
                expect(page.get_by_text("Last verified quote · delayed", exact=True)).to_be_visible()
                expect(page.get_by_text("$0.000000076637409", exact=True)).to_be_visible()
        elif offline_providers:
            expect(page.get_by_text("Market data unavailable", exact=True)).to_be_visible()
        holders = page.get_by_role("button", name="Holders", exact=True)
        holders.click()
        expect(holders).to_have_attribute("aria-pressed", "true")
        transactions = page.get_by_role("button", name="Transactions", exact=True)
        transactions.click()
        expect(transactions).to_have_attribute("aria-pressed", "true")
        token = navigation.get_by_role("link", name="Token", exact=True)
        token.click()
        expect(page).to_have_url(urljoin(url, "/token/"))
        expect(token).to_have_attribute("aria-current", "page")
        verify_page(page, "token", "Contract details", width, output)
        contract = page.locator(".contract-grid")
        expect(contract.locator("dd")).to_have_text([
            "PUMP", "$PUMP", "Token-2022", "X1 Mainnet", "18,446,744,073.71", "9", "Disabled", "SVM / Solana-compat",
        ])
        columns = contract.evaluate("element => getComputedStyle(element).gridTemplateColumns.split(' ').length")
        assert columns == (2 if width <= 720 else 4)
        cells = contract.locator(":scope > div").evaluate_all("cells => cells.map(cell => [cell.offsetWidth, cell.offsetHeight])")
        assert max(cell[0] for cell in cells) - min(cell[0] for cell in cells) <= 1
        assert len({cell[1] for cell in cells}) == 1
        expect(page.get_by_text("Pumps1XfLYk4DttvL4ai9WsKtqPvoT5DE3AsijSzb2C", exact=True)).to_be_visible()
        page.get_by_role("button", name="Copy contract address").click()
        expect(page.get_by_text("✓ Copied!", exact=True)).to_be_visible()

        community = navigation.get_by_role("link", name="Community", exact=True)
        community.click()
        expect(page).to_have_url(urljoin(url, "/community/"))
        expect(community).to_have_attribute("aria-current", "page")
        verify_page(page, "community", "Join the movement", width, output)
        expect(page.get_by_role("link", name="Telegram")).to_be_visible()
        assert page.evaluate("window.pumpNavigationDocument === true"), "Navigation replaced the document"
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
            "routes": ["/", "/market/", "/token/", "/community/"],
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
    parser.add_argument("--verify-globe", action="store_true", help="Also check WebGL rendering and reduced motion")
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
        if args.verify_globe:
            verify_globe(playwright, args.url, args.output)
        browser = playwright.chromium.launch(channel="msedge", args=["--disable-webgl"])
        try:
            results = [capture(browser, args.url, width, args.output, args.offline_providers, replay) for width in WIDTHS]
        finally:
            browser.close()
    (args.output / "results.json").write_text(json.dumps(results, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
