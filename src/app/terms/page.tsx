import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="bg-background text-on-background font-lexend min-h-screen px-margin-mobile md:px-margin-desktop py-24">
      <main className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-black italic mb-6">Terms of Service</h1>

        <p className="text-on-surface-variant mb-4">Welcome to FitTrack. By using our service you agree to the following basic terms.</p>

        <h2 className="text-2xl font-bold mt-6 mb-2">Use of the platform</h2>
        <p className="text-on-surface-variant">You may use FitTrack for personal fitness tracking. Do not misuse the platform or attempt to disrupt service.</p>

        <h2 className="text-2xl font-bold mt-6 mb-2">Content</h2>
        <p className="text-on-surface-variant">You retain ownership of the content you upload, but grant FitTrack a license to operate and display it as needed to provide the service.</p>

        <h2 className="text-2xl font-bold mt-6 mb-2">Limitations</h2>
        <p className="text-on-surface-variant">FitTrack is provided as-is. We are not responsible for workout outcomes. Follow instructions and consult professionals when needed.</p>

        <div className="mt-12">
          <Link href="/" className="text-primary-container font-bold">Back to home</Link>
        </div>
      </main>
    </div>
  );
}
