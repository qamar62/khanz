"use client";

import { useParams } from "next/navigation";
import { ComingSoon } from "@/components/dashboard/ui";

const FEATURES: Record<string, { title: string; text: string; points: string[] }> = {
  pos: {
    title: "Point of Sale",
    text: "Take dine-in, takeaway and phone orders at the counter using the same menu and prices as the website.",
    points: ["Product grid with categories and search", "Cart with dish options, notes and table number", "Cash and card (Stripe Terminal) payments", "Orders flow straight into the kitchen board"],
  },
  "floor-plan": {
    title: "Table & Floor Plan",
    text: "See every table at a glance and seat reservations on a live floor map.",
    points: ["Drag-and-drop layout per restaurant", "Live status: free, reserved, seated, needs cleaning", "Assign bookings to tables", "Walk-in waitlist"],
  },
  inventory: {
    title: "Inventory",
    text: "Track stock and get warned before a dish sells out.",
    points: ["Ingredients and suppliers", "Low-stock alerts", "Auto-hide dishes when out of stock", "Purchase orders"],
  },
  settings: {
    title: "Settings",
    text: "Manage restaurants, opening hours, staff roles and payment settings from here.",
    points: ["Opening hours and booking slots", "Staff accounts and roles", "Card fee, pickup prep time, guest checkout", "Email and notification preferences"],
  },
};

export default function ComingSoonPage() {
  const params = useParams<{ feature: string }>();
  const feature = FEATURES[String(params.feature)] ?? { title: "Coming soon", text: "This section is being built.", points: [] };
  return <div className="py-6"><ComingSoon {...feature} /></div>;
}
