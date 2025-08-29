import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
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
import Placeholder from "@/pages/Placeholder";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/en-US" replace />} />
          <Route path=":locale" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="works" element={<Works />} />
            <Route path="about" element={<Placeholder title="About" />} />
            <Route path="contact" element={<Placeholder title="Contact" />} />
            <Route path="privacy" element={<Placeholder title="Privacy" />} />
            <Route path="terms" element={<Placeholder title="Terms" />} />
            <Route path="works/:slug" element={<Placeholder title="Work detail" />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route path="*" element={<Navigate to="/en-US" replace />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
