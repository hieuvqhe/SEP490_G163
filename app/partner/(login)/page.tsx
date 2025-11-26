"use client";

import React, { useRef, useState } from "react";
import Hero5 from "./components/Hero5";
import NewsletterSection from "./components/NewsLetter";

import LoginForm from "./components/LoginForm";
import Navbar from "./components/Navbar";
import { useRouter } from "next/navigation";
import { LoginResponse } from "@/services/authService";

const Page = () => {
  const [loginForm, setLoginForm] = useState<boolean>(false);
  const newsletterRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  const scrollToNewsletter = () => {
    newsletterRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleLoginSuccess = (data: LoginResponse) => {
    console.log("Login successful:", data);
    const role = data.result?.role?.toLowerCase?.();
    console.log("Redirecting with role from response:", role);

    if (!role) {
      router.push("/");
      return;
    }

    if (role === "User") {
      router.push("/");
      return;
    }

    setLoginForm(false);
    router.push("/partner/home");
  };

  return (
    <div className="relative w-full min-h-screen bg-black pt-20">
      <Navbar setLoginForm={setLoginForm} action={scrollToNewsletter} />
      <Hero5 />
      <div ref={newsletterRef}>
        <NewsletterSection />
      </div>
      {loginForm && (
        <LoginForm
          setLoginForm={setLoginForm}
          action={scrollToNewsletter}
          onSuccess={handleLoginSuccess}
        />
      )}

      {/* <FileUpload /> */}
      {/* <CloudinaryUpload /> */}
    </div>
  );
};

export default Page;
