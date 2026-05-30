export interface Listing {
  id:        number;
  seller:    string;
  token:     string;
  amount:    bigint;
  priceUsdc: bigint;
  active:    boolean;
}