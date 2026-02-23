"use client";

import { FormEvent, MouseEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { EncryptedText } from "@/components/ui/encrypted-text";
import Image from "next/image";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  const router = useRouter();
  const callbackUrl = "/";

  const handleEmailLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("sending");

    sessionStorage.setItem("tmail", email);

    const res = await signIn("email", { email, redirect: false, callbackUrl: "/" });

    router.push(
      "/check-email"
    );
    setStatus("sent");
  };

  const arr = [
    "https://images.pexels.com/photos/1768060/pexels-photo-1768060.jpeg", //Sun
    "https://images.pexels.com/photos/2277923/pexels-photo-2277923.jpeg", //Mon
    "https://images.pexels.com/photos/3045245/pexels-photo-3045245.jpeg", //Tue
    "https://images.pexels.com/photos/632470/pexels-photo-632470.jpeg", //Wed
    "https://images.pexels.com/photos/285889/pexels-photo-285889.jpeg", // Thu
    "https://images.pexels.com/photos/733856/pexels-photo-733856.jpeg", // Fri
    "https://images.pexels.com/photos/5842/people-vintage-photo-memories.jpg", // Sat
  ];

  const rand = new Date().getDay();

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background">
      <div className="flex w-full">
        {/* Left image panel */}
        <div className="hidden h-screen overflow-hidden md:block md:w-2/5 lg:w-3/5">
          <Image
            src={arr[rand]}
            alt="Decorative sign-in image"
            width={1920}
            height={1080}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Right login panel */}
        <div className="w-full flex items-center justify-center overflow-hidden bg-background p-8 md:w-3/5 lg:w-2/5 sm:p-16">
          <div className="space-y-4 pb-8 bg-background w-full max-w-md">
            {/* Header */}
            <header className="text-center justify-center">
              <a href="/">
                <div
                  className="mb-6 inline-flex h-18 w-18 items-center justify-center rounded-xl z-10 bg-card-overlay border border-overlay"
                >
                  <Image
                    src="/Ojas.png"
                    alt="Ojas Logo"
                    width={72}
                    height={72}
                  />
                </div>
              </a>
              <h1 className="text-2xl font-bold text-action">
                Log in to
                <EncryptedText text="Ojas" className="flex justify-center text-5xl" revealDelayMs={77} flipDelayMs={77} charset="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789" />
              </h1>
            </header>

            {/* Magic link form (NextAuth email) */}
            <form onSubmit={handleEmailLogin} className="space-y-3 mt-6">
              <label className="block text-sm font-medium mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@email.com"
                className="w-full rounded-xl bg-card-overlay px-4 py-3 text-gray-primary placeholder-gray-400 transition-all duration-200 focus:border-purple-400 focus:bg-overlay focus:outline-none"
              />

              <button
                type="submit"
                disabled={status === "sending"}
                className="relative w-full rounded-xl py-3 font-medium text-white transition-all duration-200 disabled:opacity-70 bg-action hover:bg-teal-700 hover:scale-102"
                style={{
                  border: "0.5px solid var(--accent)",
                }}
              >
                {status === "sending" ? "Sending..." : "Continue with Email"}
              </button>
            </form>

            {/* Divider */}
            <div className="mt-6 mb-4 flex items-center gap-2 w-[90%] mx-auto">
              <span className="h-px flex-1 bg-gray-primary" />
              <span className="text-xs uppercase text-gray-primary">
                Or
              </span>
              <span className="h-px flex-1 bg-gray-primary" />
            </div>

            <div className="space-y-4">
              {/* Google */}
              <button
                type="button"
                onClick={() =>
                  signIn("google", {
                    callbackUrl: "/",
                  })
                }
                className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 px-6 font-medium transition-all duration-200 hover:scale-102 bg-overlay"
                style={{
                  border: "0.5px solid var(--accent)",
                }}
              >
                <Icon icon="flat-color-icons:google" className="h-5 w-5" />
                Continue with Google
              </button>
            </div>
            <div className="space-y-4">
              {/* Microsoft */}
              <button
                type="button"
                onClick={() =>
                  signIn("azure-ad", {
                    callbackUrl: "/",
                  })
                }
                className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 px-6 font-medium transition-all duration-200 hover:scale-102 bg-overlay"
                style={{
                  border: "0.5px solid var(--accent)",
                }}
              >
                <Icon icon="logos:microsoft-icon" className="h-4 w-4" />
                Continue with Microsoft
              </button>
            </div>

            <p className="text-center text-sm mt-4">
              First time here? Just log in;<br />
              We’ll take care of everything 🌿
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
