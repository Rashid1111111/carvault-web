import { EmailOtpForm } from "../EmailOtpForm";

export default function LoginPage() {
  return (
    <EmailOtpForm
      title="Sign in to CarVault"
      ctaLabel="Continue"
      buttonClassName="w-full min-h-[3.25rem] rounded-xl bg-emerald-500 px-4 text-base font-semibold text-white shadow-md transition enabled:hover:bg-emerald-400 enabled:active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
    />
  );
}
