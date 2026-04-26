import Link from "next/link";
import { SIGNUP_ROLES, SIGNUP_ROLE_LABEL, type SignupRole } from "../signup-roles";

export default function ChooseAccountPage() {
  return (
    <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-sm sm:p-8">
      <h1 className="text-center text-xl font-semibold tracking-tight text-white sm:text-2xl">
        Choose your account type
      </h1>
      <p className="mt-2 text-center text-sm text-white/55">
        You&apos;ll review CarVault rules for that role before sign-up.
      </p>
      <ul className="mt-8 flex flex-col gap-3">
        {SIGNUP_ROLES.map((role) => (
          <li key={role}>
            <Link
              href={`/auth/terms?role=${encodeURIComponent(role)}`}
              className="block min-h-14 w-full rounded-xl border border-white/12 bg-white/5 px-4 py-3.5 text-center text-base font-medium text-white transition hover:border-amber-400/50 hover:bg-white/10"
            >
              {SIGNUP_ROLE_LABEL[role as SignupRole]}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
