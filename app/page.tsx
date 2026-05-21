import { Navbar, Footer, FloatingCTA } from "@/components/layout";
import {
  HeroSection,
  AboutPreview,
  SignatureDishes,
  CateringSection,
  GalleryPreview,
  ReservationBanner,
  InstagramSection,
  BranchesSection,
  GoogleReviewsSection,
} from "@/components/home";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <AboutPreview />
        <SignatureDishes />
        <BranchesSection />
        <CateringSection />
        <GalleryPreview />
        <GoogleReviewsSection />
        <ReservationBanner />
        <InstagramSection />
      </main>
      <Footer />
      <FloatingCTA />
    </>
  );
}
