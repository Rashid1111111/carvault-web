import type { SignupRole } from "../auth/signup-roles";

export const DASHBOARD_NAV: Record<SignupRole, { href: string; label: string }[]> = {
  collector: [
    { href: "/dashboard/collector", label: "Garage" },
    { href: "/dashboard/collector/discover", label: "Discover" },
  ],
  brand: [
    { href: "/dashboard/brand", label: "Showroom" },
    { href: "/dashboard/brand/posts", label: "Posts" },
  ],
  workshop: [
    { href: "/dashboard/workshop", label: "Services" },
    { href: "/dashboard/workshop/requests", label: "Requests" },
  ],
  dealer: [
    { href: "/dashboard/dealer", label: "Inventory" },
    { href: "/dashboard/dealer/listings", label: "Listings" },
  ],
};
