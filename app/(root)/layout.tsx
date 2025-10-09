import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageLayout from "../components/PageLayout";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <Header />
      {children}
    </div>
  );
};

export default layout;
