export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: MenuCategory;
  image?: string;
  spiceLevel?: 1 | 2 | 3;
  dietary?: DietaryLabel[];
  isChefSpecial?: boolean;
  isPopular?: boolean;
}

export type MenuCategory =
  | "starters"
  | "mains"
  | "tandoori"
  | "biryani"
  | "desserts"
  | "drinks";

export type DietaryLabel =
  | "vegetarian"
  | "vegan"
  | "gluten-free"
  | "dairy-free"
  | "nuts";

export interface Reservation {
  id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  occasion?: string;
  specialRequests?: string;
  status: "pending" | "confirmed" | "cancelled";
  createdAt: string;
}

export interface CateringInquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  eventType: "wedding" | "corporate" | "private" | "other";
  eventDate: string;
  guestCount: number;
  budget?: string;
  message: string;
  status: "new" | "contacted" | "quoted" | "booked" | "closed";
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  createdAt: string;
}

export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  category: "food" | "ambience" | "events";
  featured?: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  role?: string;
  content: string;
  rating: number;
  image?: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface BusinessHours {
  day: string;
  open: string;
  close: string;
  closed?: boolean;
}
