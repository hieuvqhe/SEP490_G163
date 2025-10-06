'use client';

import Header from './components/Header';
import MainContent from './components/MainContent';
import Footer from './components/Footer';
import PageLayout from './components/PageLayout';

export default function Home() {
  return (
    <PageLayout>
      <Header />
      <MainContent />
      <Footer />
    </PageLayout>
  );
}