import Link from "next/link";
import HeroCanvas from "@/components/HeroCanvas";
import LegacyHomeLink from "@/components/LegacyHomeLink";
import OrbCanvas from "@/components/OrbCanvas";
import { BUY_URL, TOKEN } from "@/lib/constants";

const destinations = [
  { href: "/market/", title: "Market", description: "Track XDEX quotes, verified pool swaps, and on-chain activity." },
  { href: "/token/", title: "Token", description: "Explore the contract, fixed supply, and tokenomics." },
  { href: "/community/", title: "Community", description: "Find the PUMP community and official links." },
];

export default function Home() {
  return (
    <>
      <LegacyHomeLink />
      <section className="site-hero flagship">
        <HeroCanvas />
        <div className="hero-grid flagship__grid">
          <div className="flagship__copy">
            <p className="flagship__network">X1 Mainnet · Token-2022</p>
            <h1>PUMP <span>IT ON X1</span></h1>
            <p className="flagship__intro">PUMP is a community token on X1 Mainnet. Explore the market, follow on-chain activity, and join the movement.</p>
            <div className="flagship__actions">
              <Link href="/market/" className="flagship__button flagship__button--primary">Explore market <span aria-hidden="true">→</span></Link>
              <a href={BUY_URL} target="_blank" rel="noopener noreferrer" className="flagship__button">Buy PUMP <span aria-hidden="true">↗</span></a>
            </div>
            <dl className="flagship__facts">
              <div><dt>Fixed supply</dt><dd>{TOKEN.supplyShort}</dd></div>
              <div><dt>Standard</dt><dd>{TOKEN.standard}</dd></div>
              <div><dt>Network</dt><dd>{TOKEN.chain}</dd></div>
            </dl>
          </div>
          <OrbCanvas />
        </div>
      </section>
      <nav className="flagship__destinations" aria-label="Explore PUMP">
        {destinations.map(({ href, title, description }) => (
          <Link href={href} key={href}>
            <span className="flagship__destination-title">{title} <span aria-hidden="true">→</span></span>
            <span>{description}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
