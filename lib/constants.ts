export const TOKEN = {
  name: 'PUMP', symbol: '$PUMP', description: 'Pump it on X1',
  chain: 'X1 Mainnet', standard: 'Token-2022',
  address: 'Pumps1XfLYk4DttvL4ai9WsKtqPvoT5DE3AsijSzb2C',
  supply: '18,446,744,073.71', supplyShort: '18.4B', decimals: 9,
  mintAuthority: 'Disabled', vm: 'SVM / Solana-compatible', inflation: '0%',
  explorerUrl: 'https://explorer.mainnet.x1.xyz/address/Pumps1XfLYk4DttvL4ai9WsKtqPvoT5DE3AsijSzb2C',
  metadataUrl: 'https://raw.githubusercontent.com/second2none-1/Pump/main/metadata.json',
  githubUrl: 'https://github.com/second2none-1/Pump',
  image: '/pump-token.png',
} as const

export const SOCIALS = [
  { name: 'Twitter / X', icon: '✕', href: 'https://twitter.com' },
  { name: 'Telegram', icon: '✈', href: 'https://t.me' },
  { name: 'GitHub', icon: '⌥', href: 'https://github.com/second2none-1/Pump' },
  { name: 'Explorer', icon: '◉', href: 'https://explorer.mainnet.x1.xyz/address/Pumps1XfLYk4DttvL4ai9WsKtqPvoT5DE3AsijSzb2C' },
] as const

export const ROADMAP = [
  { phase: 'Phase 01 — Complete', title: 'GENESIS LAUNCH', desc: 'Token-2022 contract deployed on X1 Mainnet. Fixed supply minted. Metadata committed to GitHub. Explorer verified.', tag: '✓ DEPLOYED', status: 'done' },
  { phase: 'Phase 02 — Active', title: 'LIQUIDITY EXPANSION', desc: 'xDEX pool creation via x1nexus.xyz. Liquidity provision. Trading pairs. Price discovery on X1 native DEX.', tag: '⟳ IN PROGRESS', status: 'active' },
  { phase: 'Phase 03', title: 'COMMUNITY GROWTH', desc: 'Telegram launch. Twitter presence. Influencer outreach. Holder incentive campaigns. Governance frameworks.', tag: 'UPCOMING', status: 'upcoming' },
  { phase: 'Phase 04', title: 'ECOSYSTEM INTEGRATIONS', desc: 'CEX listings. Cross-chain bridge support. DeFi protocol integrations. X1 launchpad participation.', tag: 'UPCOMING', status: 'upcoming' },
  { phase: 'Phase 05', title: 'GAMING + AI UTILITY', desc: 'PUMP in ARKbs Labs game ecosystem. In-game currency, NFT interoperability, AI utility on X1.', tag: 'VISION', status: 'upcoming' },
] as const
