import {
  HeroSection,
  AboutPreview,
  CateringSection,
  ReservationBanner,
  InstagramSection,
  BranchesSection,
  GoogleReviewsSection,
} from "@/components/home";

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <AboutPreview />
      <BranchesSection />
      <CateringSection />
      <GoogleReviewsSection />
      <ReservationBanner />
      <InstagramSection />
    </main>
  );
}
