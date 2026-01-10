
import Features from "@/components/core/home/Features";
import Stats from "@/components/core/home/Stats";
import CTA from "@/components/core/home/CTA";
import Hero from "@/components/core/home/hero/Hero";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      <CTA />
      <Footer />
    </>
  );
}
