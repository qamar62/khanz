/**
 * Google Reviews Data for Khanz Restaurant
 * Place ID: ChIJ53eXXA9LDW0RUCln9G-nBcI
 * Total Reviews: 1800+
 * Average Rating: 5.0
 */

export interface GoogleReview {
  id: string;
  author: string;
  rating: number;
  date: string;
  text: string;
  avatar?: string;
}

export const aggregateRating = {
  rating: 5.0,
  totalReviews: 1800,
  googlePlaceId: "ChIJ53eXXA9LDW0RUCln9G-nBcI",
  googleUrl: "https://maps.app.goo.gl/Uz2YcinsxCTmau2g8",
};

// Featured Google Reviews - Update these with your actual latest reviews
export const googleReviews: GoogleReview[] = [
  {
    id: "1",
    author: "Sarah Johnson",
    rating: 5,
    date: "2 weeks ago",
    text: "Absolutely outstanding! The fusion buffet exceeded all expectations. The variety of Asian dishes was incredible, and everything was fresh and flavorful. The staff were attentive and friendly. Will definitely be returning!",
  },
  {
    id: "2",
    author: "Michael Chen",
    rating: 5,
    date: "3 weeks ago",
    text: "Best Asian restaurant in Auckland! The quality of food is exceptional, especially the tandoori dishes and Mediterranean options. Great value for money. The ambiance is perfect for family dinners.",
  },
  {
    id: "3",
    author: "Emma Williams",
    rating: 5,
    date: "1 month ago",
    text: "Fantastic experience from start to finish. The buffet selection is amazing with so many authentic dishes. The butter chicken and lamb rogan josh were absolutely delicious. Highly recommend for anyone who loves quality Asian cuisine!",
  },
  {
    id: "4",
    author: "David Kumar",
    rating: 5,
    date: "1 month ago",
    text: "We celebrated our anniversary here and it was perfect! The staff went above and beyond to make it special. The food quality is consistently excellent. The fusion of flavors is unique and delicious.",
  },
  {
    id: "5",
    author: "Lisa Anderson",
    rating: 5,
    date: "2 months ago",
    text: "This place is a hidden gem! The variety in the buffet is incredible - from traditional curries to Mediterranean dishes. Everything is cooked to perfection. The service is impeccable and the atmosphere is lovely.",
  },
  {
    id: "6",
    author: "James Park",
    rating: 5,
    date: "2 months ago",
    text: "Outstanding food and service! We've been coming here for years and it never disappoints. The quality is always top-notch. Perfect for both casual dining and special occasions. The takeaway service is also excellent!",
  },
  {
    id: "7",
    author: "Priya Sharma",
    rating: 5,
    date: "2 months ago",
    text: "Authentic flavors that remind me of home! The spices are perfectly balanced and the dishes are prepared with care. The staff are warm and welcoming. This is our go-to restaurant for family gatherings.",
  },
  {
    id: "8",
    author: "Tom Wilson",
    rating: 5,
    date: "3 months ago",
    text: "Incredible dining experience! The buffet offers amazing value with such a wide selection. Every dish we tried was delicious. The restaurant is clean, modern, and the staff are very professional.",
  },
  {
    id: "9",
    author: "Rachel Lee",
    rating: 5,
    date: "3 months ago",
    text: "Best buffet in Auckland hands down! The quality and variety are unmatched. Love that they have both Asian and Mediterranean options. The desserts are also fantastic. We come here at least once a month!",
  },
  {
    id: "10",
    author: "Mark Thompson",
    rating: 5,
    date: "3 months ago",
    text: "Exceptional food and atmosphere! We hosted a corporate event here and everything was perfect. The catering team was professional and the food received rave reviews from all our guests. Highly recommended!",
  },
];
