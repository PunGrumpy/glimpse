const compact = new Intl.NumberFormat("en", {
  maximumFractionDigits: 1,
  notation: "compact",
});
const full = new Intl.NumberFormat("en");
const date = new Intl.DateTimeFormat("en", { dateStyle: "medium" });

export const formatCount = (n: number) => compact.format(n);
export const formatExact = (n: number) => full.format(n);
export const formatDate = (unixSeconds: number) =>
  date.format(new Date(unixSeconds * 1000));
