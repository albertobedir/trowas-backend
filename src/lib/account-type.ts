export type AccountType = "individual" | "corporate";

export type AccountUser = {
  accountType?: string | null;
  team?: string | null;
};

export function isIndividualAccount(user?: AccountUser | null): boolean {
  if (!user) return false;
  if (user.accountType === "individual") return true;
  if (user.team) return false;
  return true;
}

export function isCorporateAccount(user?: AccountUser | null): boolean {
  if (!user) return true;
  return !isIndividualAccount(user);
}
