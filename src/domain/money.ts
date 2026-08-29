export type Currency = "USD";

export type Money = {
  amountCents: number;
  currency: Currency;
};

export function formatMoney(money: Money): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: money.currency,
  }).format(money.amountCents / 100);
}
