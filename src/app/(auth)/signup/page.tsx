import Link from "next/link";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata = { title: "Enlist — IRON TRACK" };

export default function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  return (
    <>
      <div className="text-center mb-stack-lg">
        <h2 className="font-headline-lg text-headline-lg text-primary-container uppercase italic tracking-tighter">
          IRON TRACK
        </h2>
        <h3 className="font-headline-md text-headline-md text-on-surface uppercase mt-stack-sm">
          Enlist
        </h3>
      </div>

      <AuthForm mode="signup" searchParamsPromise={searchParams} />

      <div className="text-center mt-stack-lg">
        <p className="font-body-md text-body-md text-on-surface-variant">
          Already drafted?
          <Link
            className="text-primary-container uppercase font-bold italic hover:text-inverse-primary border-b-2 border-transparent hover:border-inverse-primary transition-all ml-2"
            href="/login"
          >
            Identify
          </Link>
        </p>
      </div>
    </>
  );
}
