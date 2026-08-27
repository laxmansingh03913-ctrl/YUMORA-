export interface CoinPackageConfig {
  id: string;
  coins: number;
  bonusCoins: number;
  priceInr: number;
  priceUsd: number;
  label: string;
  isPopular?: boolean;
  isBestValue?: boolean;
  badge?: string;
}

export const TRUSTED_COIN_PACKAGES: Record<string, CoinPackageConfig> = {
  "coin-pack-starter": {
    id: "coin-pack-starter",
    coins: 100,
    bonusCoins: 0,
    priceInr: 79,
    priceUsd: 0.99,
    label: "Starter Pouch",
  },
  "coin-pack-popular": {
    id: "coin-pack-popular",
    coins: 500,
    bonusCoins: 50,
    priceInr: 399,
    priceUsd: 4.99,
    label: "Reader's Chest",
    isPopular: true,
    badge: "Most Popular (+10%)",
  },
  "coin-pack-champion": {
    id: "coin-pack-champion",
    coins: 1000,
    bonusCoins: 200,
    priceInr: 799,
    priceUsd: 9.99,
    label: "Champion's Vault",
    isBestValue: true,
    badge: "Best Value (+20%)",
  },
  "coin-pack-sovereign": {
    id: "coin-pack-sovereign",
    coins: 2500,
    bonusCoins: 600,
    priceInr: 1999,
    priceUsd: 24.99,
    label: "Sovereign Treasury",
    badge: "+24% Bonus",
  },
};

export const COIN_PACKAGES_LIST = Object.values(TRUSTED_COIN_PACKAGES);

export function getPackageById(packageId?: string | null): CoinPackageConfig | null {
  if (!packageId) return null;
  return TRUSTED_COIN_PACKAGES[packageId] || null;
}
