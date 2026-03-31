import Link from "next/link";

export const metadata = {
  title: "Terms of Service | Studdia",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#060608] text-white font-sans px-6 py-16 flex flex-col items-center">
      <div className="max-w-2xl w-full">
        <Link href="/" className="text-xs text-gray-500 hover:text-gray-300 transition-colors mb-8 inline-flex items-center gap-1.5">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Back to home
        </Link>

        <h1 className="text-3xl font-black tracking-tight mb-2 mt-4">Terms of Service</h1>
        <p className="text-gray-500 text-sm mb-10">Last updated: March 31, 2026</p>

        <div className="space-y-8 text-gray-300 text-sm leading-relaxed">
          <section>
            <h2 className="text-white font-bold text-base mb-2">1. Acceptance of Terms</h2>
            <p>By accessing or using Studdia ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-2">2. Description of Service</h2>
            <p>Studdia is a web application that provides focus and productivity tools including Pomodoro timers, ambience sounds, task management, and curated music playlists. The Service is provided free of charge.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-2">3. User Accounts</h2>
            <p>You may sign in to Studdia using your Google account via OAuth 2.0. By signing in, you authorize us to access basic profile information (name and email address) solely for the purpose of identifying your account and saving your preferences.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-2">4. Acceptable Use</h2>
            <p>You agree not to misuse the Service, attempt to gain unauthorized access, disrupt or overload our infrastructure, or use the Service for any unlawful purpose.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-2">5. Intellectual Property</h2>
            <p>All content and code within the Service are the property of Studdia and its developers. You may not copy, reproduce, or distribute any part of the Service without explicit permission.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-2">6. Disclaimer of Warranties</h2>
            <p>The Service is provided "as is" without warranty of any kind. We do not guarantee that the Service will be uninterrupted, error-free, or free of viruses or other harmful components.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-2">7. Limitation of Liability</h2>
            <p>To the fullest extent permitted by law, Studdia shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-2">8. Changes to Terms</h2>
            <p>We reserve the right to modify these terms at any time. Continued use of the Service after changes constitutes acceptance of the new terms.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-2">9. Contact</h2>
            <p>If you have questions about these Terms, please contact us at <span className="text-violet-400">support@studdia.app</span>.</p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 flex gap-6 text-xs text-gray-600">
          <Link href="/privacy" className="hover:text-gray-300 transition-colors">Privacy Policy</Link>
          <Link href="/" className="hover:text-gray-300 transition-colors">Home</Link>
        </div>
      </div>
    </main>
  );
}
