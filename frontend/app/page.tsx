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
  );
}
