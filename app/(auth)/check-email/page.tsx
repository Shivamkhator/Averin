"use client";

import { MouseEvent, useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { EncryptedText } from "@/components/ui/encrypted-text";

export default function CheckEmailPage() {
    const [email, setEmail] = useState<string>("");
    const callbackUrl = "/";
    const { data: session } = useSession();

    useEffect(() => {
        const stored = sessionStorage.getItem("tmail");
        if (stored) setEmail(stored);
    }, []);

    const [cooldown, setCooldown] = useState<number>(0);
    useEffect(() => {
        let t: NodeJS.Timeout | null = null;
        if (cooldown > 0) {
            t = setTimeout(() => setCooldown((c) => c - 1), 1000);
        }
        return () => {
            if (t) clearTimeout(t);
        };
    }, [cooldown]);

    useEffect(() => {
        if (session?.user?.email) {
            sessionStorage.removeItem("tmail");
        }
    }, [session]);

    const handleResend = async () => {
        if (!email || cooldown > 0) return;
        setCooldown(30);
        await signIn("email", { email, callbackUrl, redirect: false });
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
                                        src="/Averin.png"
                                        alt="Averin Logo"
                                        width={72}
                                        height={72}
                                    />
                                </div>
                            </a>
                            <h1 className="text-2xl font-bold text-action">
                                <EncryptedText text="Averin" className="flex justify-center text-5xl" revealDelayMs={77} flipDelayMs={77} charset="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789" />
                            </h1>
                        </header>

                        <div className="space-y-3 mt-6 justify-center text-center">
                            <h1 className="text-3xl font-semibold text-gray-500 mb-3">Check your inbox</h1>

                            <p className="text-sm text-gray-500 opacity-70 max-w-xs mx-auto">
                                A sign in link has been sent to your email address. Click the link in the message to complete login.
                            </p>

                            <button
                                onClick={handleResend}
                                disabled={cooldown > 0 || !email}
                                className="relative w-full rounded-xl py-3 font-medium transition-all duration-200 disabled:opacity-70 bg-action hover:scale-102 mt-6"
                            >
                                <span className="text-white">
                                    {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend Login Link"}
                                </span>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <button
                                type="button"
                                onClick={() => window.location.assign("/login")}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-overlay py-2.5 px-6 font-medium hover:text-[#0a0a0a] transition-all duration-200 hover:scale-102"
                            >
                                Return to Login
                            </button>
                        </div>
                        <div className="flex justify-center">
                            <p className="text-xs text-slate-500">
                                The provided link will expire in 10 minutes.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}