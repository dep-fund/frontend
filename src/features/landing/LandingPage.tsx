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
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Login from '../../features/auth/Login';
import Register from '../../features/auth/Register';


export default function LandingPage() {
  const navigate = useNavigate();
  const [isLoginPanelOpen, setIsLoginPanelOpen] = useState(false);
  const [isRegisterPanelOpen, setIsRegisterPanelOpen] = useState(false);

  const openLoginPanel = () => { 
    setIsLoginPanelOpen(true); 
    setIsRegisterPanelOpen(false); 
  };
  const closeLoginPanel = () => setIsLoginPanelOpen(false);

  const openRegisterPanel = () => { 
    setIsRegisterPanelOpen(true); 
    setIsLoginPanelOpen(false); 
  };
  const closeRegisterPanel = () => setIsRegisterPanelOpen(false);

  const openForgotPasswordPage = () => {
    navigate('/forgot-password');
  };

  return (
    <div className="landing-root">
      <Navbar onLoginClick={openLoginPanel} onRegisterClick={openRegisterPanel} />

      <Hero />
      <Stats />
      <WhatIsDepFund />
      <WhyDepFund />
      <HowItWorks />
      <FeaturedProjects />
      <CTA onRegisterClick={openRegisterPanel} />
      <Footer />

      <Login
        isOpen={isLoginPanelOpen}
        onClose={closeLoginPanel}
        onRegisterClick={openRegisterPanel}
        onForgotPasswordClick={openForgotPasswordPage}
      />
      <Register
        isOpen={isRegisterPanelOpen}
        onClose={closeRegisterPanel}
        onLoginClick={openLoginPanel}
      />
    </div>
  );
}
