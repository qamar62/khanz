import { MenuItem, Testimonial, BusinessHours, GalleryImage } from "./types";

export const menuItems: MenuItem[] = [
  // Starters
  {
    id: "s1",
    name: "Samosa",
    description:
      "Crispy golden pastry filled with spiced potatoes and peas, served with mint chutney",
    price: 12,
    category: "starters",
    spiceLevel: 1,
    dietary: ["vegetarian"],
    isPopular: true,
  },
  {
    id: "s2",
    name: "Lamb Seekh Kebab",
    description:
      "Tender minced lamb skewers infused with aromatic spices, grilled to perfection",
    price: 18,
    category: "starters",
    spiceLevel: 2,
    isChefSpecial: true,
  },
  {
    id: "s3",
    name: "Paneer Tikka",
    description:
      "Marinated cottage cheese cubes grilled with bell peppers and onions",
    price: 16,
    category: "starters",
    spiceLevel: 1,
    dietary: ["vegetarian", "gluten-free"],
  },
  {
    id: "s4",
    name: "Prawn Koliwada",
    description:
      "Crispy battered prawns with coastal spices and curry leaf tempering",
    price: 22,
    category: "starters",
    spiceLevel: 2,
  },
  {
    id: "s5",
    name: "Aloo Tikki Chaat",
    description:
      "Crispy potato patties topped with yogurt, chutneys, and pomegranate",
    price: 14,
    category: "starters",
    spiceLevel: 1,
    dietary: ["vegetarian", "gluten-free"],
  },

  // Mains
  {
    id: "m1",
    name: "Butter Chicken",
    description:
      "Tender chicken in rich tomato and cream sauce with kasuri methi",
    price: 28,
    category: "mains",
    spiceLevel: 1,
    isPopular: true,
  },
  {
    id: "m2",
    name: "Lamb Rogan Josh",
    description:
      "Slow-cooked lamb in aromatic Kashmiri spices with caramelized onions",
    price: 32,
    category: "mains",
    spiceLevel: 2,
    isChefSpecial: true,
  },
  {
    id: "m3",
    name: "Palak Paneer",
    description:
      "Creamy spinach curry with house-made cottage cheese and hint of cream",
    price: 24,
    category: "mains",
    spiceLevel: 1,
    dietary: ["vegetarian", "gluten-free"],
  },
  {
    id: "m4",
    name: "Prawn Malabari",
    description: "Tiger prawns in coconut cream curry with curry leaves",
    price: 34,
    category: "mains",
    spiceLevel: 2,
    dietary: ["gluten-free"],
  },
  {
    id: "m5",
    name: "Dal Makhani",
    description: "Black lentils slow-cooked overnight with cream and butter",
    price: 22,
    category: "mains",
    spiceLevel: 1,
    dietary: ["vegetarian"],
    isPopular: true,
  },
  {
    id: "m6",
    name: "Chicken Chettinad",
    description:
      "Fiery South Asian curry with freshly ground spices and black pepper",
    price: 28,
    category: "mains",
    spiceLevel: 3,
  },
  {
    id: "m7",
    name: "Goat Curry",
    description: "Traditional bone-in goat curry slow-cooked with whole spices",
    price: 34,
    category: "mains",
    spiceLevel: 2,
    isChefSpecial: true,
  },

  // Tandoori
  {
    id: "t1",
    name: "Tandoori Chicken",
    description:
      "Half chicken marinated in yogurt and spices, roasted in clay oven",
    price: 26,
    category: "tandoori",
    spiceLevel: 2,
    dietary: ["gluten-free"],
    isPopular: true,
  },
  {
    id: "t2",
    name: "Lamb Chops",
    description: "Premium lamb cutlets with mint and saffron marinade",
    price: 38,
    category: "tandoori",
    spiceLevel: 2,
    dietary: ["gluten-free"],
    isChefSpecial: true,
  },
  {
    id: "t3",
    name: "Fish Tikka",
    description:
      "Fresh market fish marinated with ajwain and grilled in tandoor",
    price: 30,
    category: "tandoori",
    spiceLevel: 1,
    dietary: ["gluten-free"],
  },
  {
    id: "t4",
    name: "Mixed Grill Platter",
    description:
      "Selection of tandoori chicken, lamb seekh, fish tikka and prawns",
    price: 48,
    category: "tandoori",
    spiceLevel: 2,
    dietary: ["gluten-free"],
  },

  // Biryani
  {
    id: "b1",
    name: "Chicken Biryani",
    description:
      "Fragrant basmati rice layered with spiced chicken and saffron",
    price: 28,
    category: "biryani",
    spiceLevel: 2,
    isPopular: true,
  },
  {
    id: "b2",
    name: "Lamb Biryani",
    description: "Slow-cooked lamb with aged basmati and caramelized onions",
    price: 32,
    category: "biryani",
    spiceLevel: 2,
    isChefSpecial: true,
  },
  {
    id: "b3",
    name: "Vegetable Biryani",
    description: "Garden vegetables with aromatic rice and mint raita",
    price: 24,
    category: "biryani",
    spiceLevel: 1,
    dietary: ["vegetarian"],
  },
  {
    id: "b4",
    name: "Prawn Biryani",
    description: "Tiger prawns with coconut-infused biryani rice",
    price: 36,
    category: "biryani",
    spiceLevel: 2,
  },

  // Desserts
  {
    id: "d1",
    name: "Gulab Jamun",
    description: "Golden milk dumplings soaked in rose-scented cardamom syrup",
    price: 12,
    category: "desserts",
    dietary: ["vegetarian"],
    isPopular: true,
  },
  {
    id: "d2",
    name: "Kulfi",
    description: "Traditional Asian ice cream with pistachios and saffron",
    price: 14,
    category: "desserts",
    dietary: ["vegetarian", "gluten-free"],
  },
  {
    id: "d3",
    name: "Rasmalai",
    description: "Soft cheese patties in sweetened saffron milk with almonds",
    price: 14,
    category: "desserts",
    dietary: ["vegetarian", "gluten-free"],
    isChefSpecial: true,
  },
  {
    id: "d4",
    name: "Mango Cheesecake",
    description: "Fusion dessert with alphonso mango and cardamom crumb base",
    price: 16,
    category: "desserts",
    dietary: ["vegetarian"],
  },

  // Drinks
  {
    id: "dr1",
    name: "Mango Lassi",
    description: "Creamy yogurt smoothie with Alphonso mango puree",
    price: 8,
    category: "drinks",
    dietary: ["vegetarian", "gluten-free"],
    isPopular: true,
  },
  {
    id: "dr2",
    name: "Masala Chai",
    description:
      "Traditional spiced tea with cardamom, ginger, and cinnamon",
    price: 6,
    category: "drinks",
    dietary: ["vegetarian", "gluten-free"],
  },
  {
    id: "dr3",
    name: "Rose Sherbet",
    description: "Refreshing rose water drink with basil seeds",
    price: 7,
    category: "drinks",
    dietary: ["vegan", "gluten-free"],
  },
  {
    id: "dr4",
    name: "Fresh Lime Soda",
    description: "Zesty lime with mint and your choice of sweet or salted",
    price: 6,
    category: "drinks",
    dietary: ["vegan", "gluten-free"],
  },
];

export const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Sarah Mitchell",
    role: "Food Critic, NZ Herald",
    content:
      "An exceptional dining experience that rivals the finest establishments in Auckland. The attention to detail in every dish is remarkable, and the ambiance transports you to a world of refined elegance.",
    rating: 5,
  },
  {
    id: "2",
    name: "James & Emily Thompson",
    role: "Wedding Clients",
    content:
      "Khanz catered our wedding for 200 guests, and it was absolutely perfect. Every single guest complimented the food. The team went above and beyond to make our special day unforgettable.",
    rating: 5,
  },
  {
    id: "3",
    name: "Michael Chen",
    role: "Corporate Events Manager",
    content:
      "We have used Khanz for multiple corporate events, and they consistently deliver exceptional quality. Professional service, stunning presentation, and flavors that impress every time.",
    rating: 5,
  },
  {
    id: "4",
    name: "Priya Sharma",
    content:
      "Finding authentic flavors is rare. Khanz brings the taste of home with a sophisticated twist. The Lamb Rogan Josh is the best I have had outside of Asia.",
    rating: 5,
  },
  {
    id: "5",
    name: "David Wilson",
    role: "Local Food Blogger",
    content:
      "From the moment you walk in, you know this is special. The warm lighting, attentive staff, and incredible aromas create an atmosphere that is both luxurious and welcoming.",
    rating: 5,
  },
];

export const businessHours: BusinessHours[] = [
  { day: "Monday", open: "11:30 AM", close: "10:00 PM" },
  { day: "Tuesday", open: "11:30 AM", close: "10:00 PM" },
  { day: "Wednesday", open: "11:30 AM", close: "10:00 PM" },
  { day: "Thursday", open: "11:30 AM", close: "10:00 PM" },
  { day: "Friday", open: "11:30 AM", close: "11:00 PM" },
  { day: "Saturday", open: "11:30 AM", close: "11:00 PM" },
  { day: "Sunday", open: "12:00 PM", close: "9:00 PM" },
];

export const galleryImages: GalleryImage[] = [
  {
    id: "g1",
    src: "/images/gallery/food-1.jpg",
    alt: "Signature Butter Chicken",
    category: "food",
    featured: true,
  },
  {
    id: "g2",
    src: "/images/gallery/food-2.jpg",
    alt: "Tandoori Mixed Grill",
    category: "food",
  },
  {
    id: "g3",
    src: "/images/gallery/food-3.jpg",
    alt: "Lamb Biryani presentation",
    category: "food",
  },
  {
    id: "g4",
    src: "/images/gallery/ambience-1.jpg",
    alt: "Restaurant interior",
    category: "ambience",
    featured: true,
  },
  {
    id: "g5",
    src: "/images/gallery/ambience-2.jpg",
    alt: "Private dining area",
    category: "ambience",
  },
  {
    id: "g6",
    src: "/images/gallery/events-1.jpg",
    alt: "Wedding catering setup",
    category: "events",
    featured: true,
  },
  {
    id: "g7",
    src: "/images/gallery/events-2.jpg",
    alt: "Corporate event catering",
    category: "events",
  },
  {
    id: "g8",
    src: "/images/gallery/food-4.jpg",
    alt: "Dessert platter",
    category: "food",
  },
];

export const categoryLabels: Record<string, string> = {
  starters: "Starters",
  mains: "Main Courses",
  tandoori: "Tandoori & Grill",
  biryani: "Biryani & Rice",
  desserts: "Desserts",
  drinks: "Beverages",
};

export const timeSlots = [
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "1:00 PM",
  "1:30 PM",
  "5:30 PM",
  "6:00 PM",
  "6:30 PM",
  "7:00 PM",
  "7:30 PM",
  "8:00 PM",
  "8:30 PM",
  "9:00 PM",
];

export const eventTypes = [
  { value: "wedding", label: "Wedding" },
  { value: "corporate", label: "Corporate Event" },
  { value: "private", label: "Private Party" },
  { value: "other", label: "Other" },
];

export const contactInfo = {
  phone: "+64 9 123 4567",
  email: "info@khanz.co.nz",
  address: "123 Queen Street, Auckland CBD, New Zealand",
  whatsapp: "+64211234567",
  social: {
    instagram: "https://instagram.com/khanzrestaurant",
    facebook: "https://facebook.com/khanzrestaurant",
  },
};
