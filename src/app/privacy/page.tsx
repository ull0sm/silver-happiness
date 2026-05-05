import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="bg-background text-on-background font-lexend min-h-screen px-margin-mobile md:px-margin-desktop py-24">
      <main className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-black italic mb-6">Privacy Policy</h1>

        <p className="text-on-surface-variant mb-4">
          FitTrack (“we”, “us”, “our”) collects and stores minimal data necessary to provide
          the service. This includes account/profile data, workout logs, and analytics you
          explicitly provide. We use Supabase as our data store and follow reasonable
          security practices to protect your information.
        </p>

        <h2 className="text-2xl font-bold mt-6 mb-2">What we collect</h2>
        <ul className="list-disc pl-6 text-on-surface-variant">
          <li>Account identifiers and profile details (name, username, avatar)</li>
          <li>Workout logs, session data, and body stats</li>
          <li>Aggregated analytics and non-identifying usage data</li>
        </ul>

        <h2 className="text-2xl font-bold mt-6 mb-2">How we use data</h2>
        <p className="text-on-surface-variant">To provide and improve the platform, enable social features, and support your account.</p>

        <h2 className="text-2xl font-bold mt-6 mb-2">Third parties</h2>
        <p className="text-on-surface-variant">We use Supabase for hosting and may use analytics providers; we do not sell personal data.</p>

        <h2 className="text-2xl font-bold mt-6 mb-2">Your choices</h2>
        <p className="text-on-surface-variant">You can delete your account and data via account settings. Contact support for help.</p>

        <div className="mt-12">
          <Link href="/" className="text-primary-container font-bold">Back to home</Link>
        </div>
      </main>
    </div>
  );
}
