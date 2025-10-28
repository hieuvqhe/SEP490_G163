"use client";

import React, { useRef, useState } from "react";
import Hero5 from "./components/Hero5";
import NewsletterSection from "./components/NewsLetter";

import LoginForm from "./components/LoginForm";
import Navbar from "./components/Navbar";
import FileUpload from "./components/FileUpload";
import CloudinaryUpload from "./components/CloudinaryUpload";
import { redirect } from "next/navigation";

const Page = () => {
  const [loginForm, setLoginForm] = useState<boolean>(false);
  const newsletterRef = useRef<HTMLDivElement | null>(null);

  const scrollToNewsletter = () => {
    newsletterRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleLoginSuccess = (data: {
    data: {
      accessToken: string;
      refreshToken: string;
      fullName: string;
      role: string;
    };
  }) => {
    console.log("Login successful:", data);
    const role = data.data.role;
    console.log("Redirecting with role from response:", role);

    if (!role) {
      window.location.href = "/";
      return;
    }

    const targetPath = "/partner/home";
    if (role === "partner") {
      console.log("Redirecting to:", targetPath);
      redirect(targetPath);
    }
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
