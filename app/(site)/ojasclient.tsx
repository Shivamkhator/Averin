"use client"

import React, { useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, useScroll, useTransform, MotionValue } from "framer-motion"
import { ArrowDown, Shield, Database, Search, Network } from "lucide-react"
import { useSession } from "next-auth/react";
import { PreviewCard, PreviewCardPanel, PreviewCardTrigger } from "@/components/animate-ui/components/base/preview-card";
import { Session } from "next-auth";

const features = [
    {
        id: 1,
        title: "Unified Knowledge Vault",
        subtitle: "INGEST",
        description:
            "Upload resumes, documents, images, GitHub repos, and chats into one private, searchable knowledge base.",
        color: "bg-action",
        icon: Database,
    },
    {
        id: 2,
        title: "Semantic Search",
        subtitle: "SEARCH",
        description:
            "Find ideas, concepts, and files instantly using meaning-based search, not just keywords.",
        color: "bg-purple-500",
        icon: Search,
    },
    {
        id: 3,
        title: "Knowledge Graph",
        subtitle: "RELATIONSHIPS",
        description:
            "Visualize how your notes, topics, and ideas connect with an interactive knowledge graph.",
        color: "bg-pink-500",
        icon: Network,
    },
    {
        id: 4,
        title: "Private by Design",
        subtitle: "PRIVACY",
        description:
            "Your data never trains public models. All answers are strictly generated from your personal knowledge.",
        color: "bg-green-500",
        icon: Shield,
    },
];


export default function OjasClient() {
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"],
    })

    const rotate = useTransform(scrollYProgress, [0, 1], [0, 120])

    return (
        <div ref={containerRef} className="relative bg-background text-text font-sans selection:bg-action selection:text-white">
            <HeroSection />
            <ScrollCarouselSection />
            <FooterSection />
        </div>
    )
}
const date = new Date();
const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' };
const dateString = date.toLocaleDateString(undefined, options);

function HeroSection() {
    // --- Movement state ---
    const mode = "scroll";

    // --- Scroll parallax ---
    const { scrollY } = useScroll();
    const y = useTransform(scrollY, [0, 1000], [0, 920])


    return (
        <section className="relative z-10 h-screen w-full flex flex-col justify-between p-4 md:p-12 border-b border-action/10">
            <nav className="flex flex-col md:flex-row justify-between items-start uppercase tracking-widest text-sm md:text-md font-bold text-text">
                <div>
                    Ojas by SkyBee
                </div>
                <div className="text-xs md:text-sm tracking-[0.3em] text-text italic" >
                    {dateString}
                </div>

            </nav>

            <div className="mt-auto mb-[6svh] md:mb-[4svh] mr-2 md:mr-6">
                <h1 className="text-[22vw] md:text-[15vw] leading-[0.85] font-bold text-action tracking-tighter uppercase pb-[8svh] md:pb-0">
                    Life <span className="block italic font-serif font-light text-text ml-[9vw]">Made</span> Easier
                </h1>
                <div className="flex flex-col md:flex-row justify-between items-end border-t border-action/30 py-[4svh] ">
                    <p className="max-w-md text-xl leading-relaxed text-text">
                        Your knowledge, supercharged.
                        <br />
                        <span className="opacity-70 text-text text-sm">Scroll to sync.</span>
                    </p>
                    <div className="animate-bounce mr-2">
                        <ArrowDown className="w-7 h-7 text-action" />
                    </div>
                </div>
            </div>

            <motion.div
                style={{ y }}
                className=" absolute -z-1 top-[12svh] md:right-8 pointer-events-none"
            >
                <Image
                    src="/Ojas.png"
                    alt="Ojas Logo"
                    width={420}
                    height={420}
                    priority={false}
                    draggable={false}
                />
            </motion.div>
        </section>
    );
}


function ScrollCarouselSection() {
    const targetRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["start start", "end end"],
    })

    const totalSlides = features.length

    return (
        <section ref={targetRef} className="relative h-[400svh] z-20">
            <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-center">

                <SidebarUI scrollYProgress={scrollYProgress} totalSlides={totalSlides} />

                {/* --- CENTER SPLIT LAYOUT --- */}
                <div className="relative w-full h-full flex items-center justify-center">
                    {features.map((feature, index) => (
                        <CarouselSlide
                            key={feature.id}
                            feature={feature}
                            index={index}
                            totalSlides={totalSlides}
                            scrollYProgress={scrollYProgress}
                        />
                    ))}
                </div>

            </div>
        </section>
    )
}

function SidebarUI({ scrollYProgress, totalSlides }: { scrollYProgress: MotionValue<number>, totalSlides: number }) {
    const activeIndex = useTransform(scrollYProgress, (value) => {
        const step = 1 / totalSlides
        return Math.min(Math.floor(value / step), totalSlides - 1)
    })

    return (
        <div className="absolute inset-0 pointer-events-none px-6 md:px-12 flex justify-between items-center z-30">
            <div className="h-full flex flex-col justify-center">
                <div className="overflow-hidden h-16rem flex items-end">
                    <FeatureCounter activeIndex={activeIndex} />
                </div>
            </div>
        </div>
    )
}

function FeatureCounter({ activeIndex }: { activeIndex: MotionValue<number> }) {
    const [current, setCurrent] = React.useState(0)
    React.useEffect(() => activeIndex.on("change", (v) => setCurrent(v)), [activeIndex])

    return (
        <div className="flex items-baseline mix-blend-multiply opacity-40 md:opacity-100">
            <span className="text-[12rem] leading-none font-bold text-text tabular-nums tracking-tighter">
                0{current + 1}
            </span>
        </div>
    )
}

function CarouselSlide({ feature, index, totalSlides, scrollYProgress }: any) {
    const step = 1 / totalSlides
    const start = index * step
    const end = start + step

    // Controls opacity: Fade in, stay, fade out
    const opacity = useTransform(
        scrollYProgress,
        [start - 0.05, start + 0.05, end - 0.05, end],
        [0, 1, 1, 0]
    )

    // Controls movement: The text slides up slightly while visible
    const y = useTransform(scrollYProgress, [start, end], ["150px", "100px"])

    const Icon = feature.icon

    return (
        <motion.div
            style={{ opacity }}
            className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none"
        >
            <div className="w-full h-full flex flex-col md:flex-row items-center">

                {/* LEFT */}
                <div className={`w-full md:w-1/2 h-full ${feature.color} flex items-center justify-center relative overflow-hidden`}>
                    <Icon className="absolute w-[60%] h-[60%] text-white opacity-20 -rotate-15 stroke-[0.5px]" />

                    <motion.div style={{ y }} className="relative z-10 text-white">
                        <h3 className="text-[3rem] lg:text-[6rem] font-bold leading-none tracking-tighter opacity-90 mix-blend-overlay">
                            {feature.subtitle}
                        </h3>
                    </motion.div>
                </div>

                {/* RIGHT */}
                <div className="w-full md:w-1/2 h-full flex flex-col justify-center px-12 md:px-24 pointer-events-auto bg-background/50 backdrop-blur-sm">
                    <h2 className="text-2xl lg:text-6xl font-bold text-action mb-6 uppercase leading-[0.9]">
                        {feature.title}
                    </h2>
                    <p className="text-sm lg:text-xl mb-12 max-w-md leading-relaxed">
                        {feature.description}
                    </p>
                </div>

            </div>
        </motion.div>
    )
}

function FooterSection() {
    const { data: session } = useSession();
    return (
        <section className="h-[60svh] bg-foreground flex flex-col items-center justify-center text-center p-12">
            <PreviewCard>
                <PreviewCardTrigger
                    render={
                        <Link className="text-background leading-none uppercase mb-8 text-[8vw] font-bold" href="https://shivamkhator.framer.website">Ojas
                        </Link>
                    }
                />

                <PreviewCardPanel
                    className="w-[70vw] md:w-[40vw] bg-background rounded-lg shadow-lg"
                >
                    <div className="flex gap-2">
                        <Image
                            className="w-12 h-12 rounded-full overflow-hidden border border-black/40 bg-white"
                            width={48}
                            height={48}
                            src="/SkyBee.svg"
                            alt="SkyBee"
                        />
                        <div className="flex flex-col gap-2">
                            <div>
                                <div className="font-bold">Ojas</div>
                                <div className="text-xs text-gray-primary">A SkyBee's Creation</div>
                            </div>
                            <div className="text-sm text-gray-400">
                                Building useful tools for a better digital life.
                            </div>
                            <div className="flex">
                                <Link href="mailto:skybee.hq@gmail.com" className="px-4 py-2 bg-action text-white rounded-full text-sm hover:scale-105 transition-transform">
                                    Mail Us
                                </Link>
                            </div>
                        </div>
                    </div>
                </PreviewCardPanel>
            </PreviewCard>
            <div className="flex gap-4 lg:flex-row flex-col items-center">
                <Link
                    href="/login"
                    className="py-4 w-[32vw] lg:w-[12vw] 
             border border-background/70 text-white bg-action/70 font-bold rounded-full hover:bg-action hover:scale-105 transition-all duration-200 text-sm 
             md:text-lg"
                >
                    Get Started
                </Link>

                <Link href="https://instagram.com/weareskybee" className="heart-btn">
                    <span aria-hidden="true"></span>
                    <span className="text-sm text-white w-[24vw] lg:w-[8vw] my-2">Follow Us</span>
                </Link>
                <div className="text-white">
                </div>

            </div>
        </section>
    )
}