import "./LandingPage.css";
import Navbar from "./components/Navbar";
import WhatIsDepFund from "./components/WhatIsDepFund";
import WhyDepFund from "./components/WhyDepFund";
import HowItWorks from "./components/HowItWorks";
import FeaturedProjects from "./components/FeaturedProjects";
import CTA from "./components/CTA";
import Hero from "./components/Hero";
import Footer from "./components/Footer";
import Stats from "./components/Stats";

export default function LandingPage() {
  return (
    <div className="landing-root">
      <Navbar />
      <Hero />
      <Stats />
      <WhatIsDepFund />
      <WhyDepFund />
      <HowItWorks />
      <FeaturedProjects />
      <CTA />
      <Footer />
    </div>
  );
}
