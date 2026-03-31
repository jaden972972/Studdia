import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | Studdia",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#060608] text-white font-sans px-6 py-16 flex flex-col items-center">
      <div className="max-w-2xl w-full">
        <Link href="/" className="text-xs text-gray-500 hover:text-gray-300 transition-colors mb-8 inline-flex items-center gap-1.5">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Back to home
        </Link>

        <h1 className="text-3xl font-black tracking-tight mb-2 mt-4">Privacy Policy</h1>
        <p className="text-gray-500 text-sm mb-10">Last updated: March 31, 2026</p>

        <div className="space-y-8 text-gray-300 text-sm leading-relaxed">
          <section>
            <h2 className="text-white font-bold text-base mb-2">1. Introduction</h2>
            <p>Studdia ("we", "our", or "us") is committed to protecting your personal information. This Privacy Policy explains what data we collect, how we use it, and your rights regarding it.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-2">2. Information We Collect</h2>
            <p>When you sign in with Google, we receive the following information from your Google account:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-gray-400">
              <li>Your name</li>
              <li>Your email address</li>
              <li>Your Google profile picture (avatar)</li>
            </ul>
            <p className="mt-2">We also store user-generated data such as your saved playlists and task lists within the Service.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-2">3. How We Use Your Information</h2>
            <p>We use the information collected solely to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-gray-400">
              <li>Identify and authenticate your account</li>
              <li>Save and sync your preferences across devices</li>
              <li>Provide personalized features within the Service</li>
            </ul>
            <p className="mt-2">We do not sell, rent, or share your personal data with third parties for marketing purposes.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-2">4. Data Storage</h2>
            <p>Your data is stored securely using <span className="text-violet-400">Supabase</span>, a third-party database provider. Data is encrypted in transit (HTTPS/TLS) and at rest. Supabase's privacy policy can be found at <span className="text-violet-400">supabase.com/privacy</span>.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-2">5. Cookies & Local Storage</h2>
            <p>We use cookies to maintain your authentication session. These cookies are strictly necessary to keep you logged in and are not used for tracking or advertising.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-2">6. Third-Party Services</h2>
            <p>Studdia uses the following third-party services:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-gray-400">
              <li><strong className="text-gray-300">Google OAuth</strong> — for authentication</li>
              <li><strong className="text-gray-300">Supabase</strong> — for database and auth management</li>
              <li><strong className="text-gray-300">YouTube Data API</strong> — for fetching music playlists</li>
              <li><strong className="text-gray-300">Vercel</strong> — for hosting the application</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-2">7. Data Retention & Deletion</h2>
            <p>Your data is retained for as long as your account is active. You may request deletion of your account and all associated data at any time by contacting us. We will fulfill deletion requests within 30 days.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-2">8. Children's Privacy</h2>
            <p>Studdia is not directed at children under 13. We do not knowingly collect personal information from children. If you believe a child has provided us with their data, please contact us immediately.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-2">9. Your Rights</h2>
            <p>Depending on your location, you may have rights to access, correct, or delete your personal data. To exercise these rights, contact us at <span className="text-violet-400">support@studdia.app</span>.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-2">10. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of significant changes by updating the date at the top of this page.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-2">11. Contact</h2>
            <p>If you have questions about this Privacy Policy, contact us at <span className="text-violet-400">support@studdia.app</span>.</p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 flex gap-6 text-xs text-gray-600">
          <Link href="/terms" className="hover:text-gray-300 transition-colors">Terms of Service</Link>
          <Link href="/" className="hover:text-gray-300 transition-colors">Home</Link>
        </div>
      </div>
    </main>
  );
}
