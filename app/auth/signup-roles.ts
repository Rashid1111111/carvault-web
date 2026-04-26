/** Set on terms agreement; signup checks before showing the magic-link form. */
export const SESSION_TERMS_OK_KEY = "carvault_terms_ok";
/** Must match `?role=` on /auth/signup after terms. */
export const SESSION_CHOSEN_ROLE_KEY = "carvault_chosen_role";

export const SIGNUP_ROLES = ["collector", "brand", "workshop", "dealer"] as const;

export type SignupRole = (typeof SIGNUP_ROLES)[number];

export function isSignupRole(value: string): value is SignupRole {
  return (SIGNUP_ROLES as readonly string[]).includes(value);
}

export const SIGNUP_ROLE_LABEL: Record<SignupRole, string> = {
  collector: "Collector",
  brand: "Brand",
  workshop: "Workshop",
  dealer: "Dealer",
};

const TERMS_INTRO: Record<SignupRole, string> = {
  collector:
    "Collectors use CarVault to curate and showcase vehicle collections. You agree to provide accurate information about vehicles you list and to follow our community standards.",
  brand:
    "Brands use CarVault to connect with owners and present official programs. You agree that your content represents your brand truthfully and complies with applicable advertising rules.",
  workshop:
    "Workshops use CarVault to offer services to vehicle owners. You agree to list only legitimate services, honor quoted work, and meet local regulations for your business.",
  dealer:
    "Dealers use CarVault to present inventory and engage buyers. You agree that listings are accurate, pricing is not misleading, and you follow applicable sales regulations.",
};

export function termsCopyForRole(role: SignupRole): string {
  return TERMS_INTRO[role];
}
