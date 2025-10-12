export default function PricingPage() {
  // The app uses a Pricing section on the homepage via Clerk's PricingTable.
  // Redirect users to the dedicated upgrade page for upgrades.
  return (
    <main className="max-w-4xl mx-auto p-8">
      <meta httpEquiv="refresh" content="0; url=/upgrade" />
      <p className="text-gray-700">Redirecting to upgrade…</p>
    </main>
  );
}
