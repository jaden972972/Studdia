"use client";
import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorMsg = searchParams.get("error");

  useEffect(() => {
    const { data: { subscription } } = supabaseBrowser.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          router.replace("/cockpit");
        }
      }
    );
    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <main className="h-screen w-screen bg-[#060608] text-white flex items-center justify-center font-sans">
      {/* Glow blob */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)" }}
      />

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-sm w-full">
        {/* Logo */}
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-2xl"
          style={{ background: "linear-gradient(135deg, #8b5cf6, #6d28d9)" }}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" fill="white" stroke="white" strokeWidth="0.5" strokeLinejoin="round" />
          </svg>
        </div>

        <h1 className="text-3xl font-black tracking-tight mb-1">Studdia</h1>
        <p className="text-gray-500 text-sm mb-8">Sign in to save your playlists across devices.</p>

        {errorMsg && (
          <div className="w-full mb-4 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] text-left break-all">
            <span className="font-bold">Error: </span>{decodeURIComponent(errorMsg)}
          </div>
        )}

        {/* Google button */}
        <button
          onClick={async () => {
            await supabaseBrowser.auth.signInWithOAuth({
              provider: "google",
              options: {
                redirectTo: `${window.location.origin}/auth/callback`,
              },
            });
          }}
          className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl bg-white text-black font-bold text-sm hover:bg-gray-100 transition-colors active:scale-95"
        >
          {/* Google G logo */}
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            <path fill="none" d="M0 0h48v48H0z"/>
          </svg>
          Continue with Google
        </button>

        <p className="mt-6 text-[11px] text-gray-700">
          No account needed — Google sign-in creates one automatically.
        </p>

        {/* Back link */}
        <button
          onClick={() => router.push("/")}
          className="mt-8 text-[11px] text-gray-600 hover:text-gray-300 transition-colors flex items-center gap-1.5"
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Back to home
        </button>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
