const decimalPrice = new Intl.NumberFormat("en-US", {
  useGrouping: false,
  maximumSignificantDigits: 10,
});

export function formatTokenPrice(value: number) {
  return Number.isFinite(value) ? decimalPrice.format(value) : "—";
}
