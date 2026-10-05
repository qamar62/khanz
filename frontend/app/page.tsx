import {
  HeroSection,
  ScrollStory,
  SignatureDishes,
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
      <ScrollStory />
      <SignatureDishes />
      <div id="locations">
        <BranchesSection />
      </div>
      <CateringSection />
      <GoogleReviewsSection />
      <ReservationBanner />
      <InstagramSection />
    </main>
  );
}
