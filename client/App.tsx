import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/components/site/Layout";
import Home from "@/pages/Home";
import Works from "@/pages/Works";
import WorkDetail from "@/pages/WorkDetail";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import AccountLayout, { SignIn, Register, Purchases } from "@/pages/Account";
import CheckoutWrapper from "@/pages/CheckoutWrapper";
import Profile from "@/pages/Profile";
import Splash from "@/pages/Splash";
import Start from "@/pages/Start";
import Placeholder from "@/pages/Placeholder";
import NotFound from "@/pages/NotFound";
import Admin from "@/pages/Admin";

const queryClient = new QueryClient();

import GlobalSkyLayer from "@/components/site/GlobalSkyLayer";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <GlobalSkyLayer />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Start />} />
          <Route path="splash" element={<Splash />} />
          <Route path=":locale" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="works" element={<Works />} />
            <Route path="work/:slug" element={<WorkDetail />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="privacy" element={<Placeholder title="Privacy" />} />
            <Route path="terms" element={<Placeholder title="Terms" />} />
            <Route path="checkout">
              <Route
                path="buy-all"
                element={<CheckoutWrapper mode="buy-all" />}
              />
              <Route
                path="work/:slug"
                element={<CheckoutWrapper mode="work" />}
              />
              <Route
                path="chapter/:slug/:order"
                element={<CheckoutWrapper mode="chapter" />}
              />
              <Route
                path="donation"
                element={<CheckoutWrapper mode="donation" />}
              />
            </Route>
            <Route path="account" element={<AccountLayout />}>
              <Route path="sign-in" element={<SignIn />} />
              <Route path="register" element={<Register />} />
              <Route path="purchases" element={<Purchases />} />
              <Route path="profile" element={<Profile />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route path="*" element={<Navigate to="/en-US" replace />} />
          <Route path="admin" element={<Admin />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
