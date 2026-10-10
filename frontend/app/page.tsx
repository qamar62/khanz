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
import { HomePromotions } from "@/components/promotions/promotion-banner";

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <HomePromotions />
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
