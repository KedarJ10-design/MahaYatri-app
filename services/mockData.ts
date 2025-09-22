import { User, Guide, Booking, BookingStatus, Conversation, DirectMessage, Review, Vendor, Stay, Notification } from '../types';

const today = new Date();
const formatDate = (date: Date) => date.toISOString().split('T')[0];

const getFutureDate = (days: number) => {
    const future = new Date(today);
    future.setDate(today.getDate() + days);
    return formatDate(future);
};

export const mockTouristUser: User = {
  id: 'user-1',
  name: 'Priya Sharma',
  email: 'priya.sharma@example.com',
  avatarUrl: 'https://picsum.photos/seed/tourist-woman/200/200',
  preferences: ['Historical Sites', 'Local Cuisine', 'Nature Walks'],
  emergencyContact: {
    name: 'Anil Sharma',
    phone: '+91 98765 43210',
  },
  isPro: false,
  points: 3940,
  unlockedGuideIds: ['guide-2'],
  role: 'user',
  redeemedRewardIds: ['reward-3'],
  status: 'active',
  hasPendingApplication: false,
  wishlist: [],
};

export const mockGuideUser: User = {
    id: 'guide-1', // Corresponds to Rohan Patil
    name: 'Rohan Patil',
    email: 'rohan.patil@example.com', // Using a real-world-like email for lookup
    avatarUrl: 'https://picsum.photos/seed/guide-man-mumbai/200/200',
    preferences: [],
    emergencyContact: { name: 'Support', phone: '123-456-7890' },
    isPro: true,
    points: 0,
    unlockedGuideIds: [],
    role: 'guide',
    redeemedRewardIds: [],
    status: 'active',
    hasPendingApplication: false,
    wishlist: [],
};

export const mockAdminUser: User = {
  id: 'admin-1',
  name: 'Admin User',
  email: 'admin@example.com', // Using a real-world-like email for lookup
  avatarUrl: 'https://picsum.photos/seed/admin-user/200/200',
  preferences: [],
  emergencyContact: { name: 'Support', phone: '123-456-7890' },
  isPro: true,
  points: 0,
  unlockedGuideIds: [],
  role: 'admin',
  redeemedRewardIds: [],
  status: 'active',
  hasPendingApplication: false,
  wishlist: [],
};

export const mockGuides: Guide[] = [
  {
    id: 'guide-1',
    name: 'Rohan Patil',
    location: 'Mumbai',
    avatarUrl: 'https://picsum.photos/seed/mumbai-guide/300/300',
    rating: 4.9,
    reviewCount: 124,
    languages: ['English', 'Hindi', 'Marathi'],
    specialties: ['Street Food', 'Bollywood Tours', 'History'],
    bio: 'Born and raised in Mumbai, I know every nook and cranny of this vibrant city. Let me show you the real Mumbai, from hidden food gems to the glamour of Bollywood.',
    pricePerDay: 4500,
    verificationStatus: 'verified',
    gallery: ['https://picsum.photos/seed/gateway-of-india/600/400', 'https://picsum.photos/seed/mumbai-dabbawala/600/400', 'https://picsum.photos/seed/mumbai-local-train/600/400'],
    contactInfo: {
      phone: '+91 98200 98200',
      email: 'rohan.patil@guides.mahayatri.com'
    },
    contactUnlockPrice: 250,
    availability: {
      [getFutureDate(5)]: false,
      [getFutureDate(6)]: false,
      [getFutureDate(10)]: true,
      [getFutureDate(11)]: false,
    },
  },
  {
    id: 'guide-2',
    name: 'Aisha Khan',
    location: 'Pune',
    avatarUrl: 'https://picsum.photos/seed/pune-guide/300/300',
    rating: 4.8,
    reviewCount: 98,
    languages: ['English', 'Hindi'],
    specialties: ['Trekking', 'Forts', 'Cultural Heritage'],
    bio: 'An avid trekker and history enthusiast, I specialize in tours around Pune, exploring the majestic forts of the Sahyadri mountains and the rich Maratha history.',
    pricePerDay: 4000,
    verificationStatus: 'verified',
    gallery: ['https://picsum.photos/seed/pune-fortress/600/400', 'https://picsum.photos/seed/sahyadri-trek/600/400', 'https://picsum.photos/seed/pune-old-city/600/400'],
     contactInfo: {
      phone: '+91 98900 98900',
      email: 'aisha.khan@guides.mahayatri.com'
    },
    contactUnlockPrice: 200,
    availability: {
      [getFutureDate(2)]: false,
      [getFutureDate(3)]: false,
      [getFutureDate(4)]: false,
    },
  },
  {
    id: 'guide-3',
    name: 'Vikram Singh',
    location: 'Aurangabad',
    avatarUrl: 'https://picsum.photos/seed/aurangabad-guide/300/300',
    rating: 4.9,
    reviewCount: 150,
    languages: ['English', 'Hindi', 'Marathi'],
    specialties: ['Ajanta & Ellora Caves', 'Mughal History', 'Archaeology'],
    bio: 'Explore the timeless wonders of Ajanta and Ellora with a certified archaeologist. I provide in-depth tours that bring ancient history to life.',
    pricePerDay: 5500,
    verificationStatus: 'verified',
    gallery: ['https://picsum.photos/seed/ajanta-caves/600/400', 'https://picsum.photos/seed/ellora-caves/600/400', 'https://picsum.photos/seed/bibi-qa-maqbara/600/400'],
     contactInfo: {
      phone: '+91 99220 99220',
      email: 'vikram.singh@guides.mahayatri.com'
    },
    contactUnlockPrice: 300,
    availability: {},
  },
  {
    id: 'guide-4',
    name: 'Sunita Gawde',
    location: 'Nashik',
    avatarUrl: 'https://picsum.photos/seed/nashik-guide/300/300',
    rating: 4.7,
    reviewCount: 75,
    languages: ['English', 'Marathi'],
    specialties: ['Vineyard Tours', 'Spiritual Sites', 'Local Cuisine'],
    bio: 'Discover Nashik, the wine capital of India! I offer exclusive tours of the best vineyards, combined with visits to sacred temples and delicious local food experiences. I have submitted all my documents for verification.',
    pricePerDay: 3800,
    verificationStatus: 'pending',
    gallery: ['https://picsum.photos/seed/nashik-vineyard/600/400', 'https://picsum.photos/seed/trimbakeshwar-temple/600/400', 'https://picsum.photos/seed/sula-vineyards/600/400'],
     contactInfo: {
      phone: '+91 98600 98600',
      email: 'sunita.gawde@guides.mahayatri.com'
    },
    contactUnlockPrice: 150,
    availability: {},
  },
];

export const mockVendors: Vendor[] = [
    {
        id: 'vendor-1',
        name: 'Bademiya',
        location: 'Mumbai',
        type: 'Street Food',
        cuisine: ['Mughlai', 'Kebab'],
        rating: 4.5,
        reviewCount: 2500,
        priceRange: '$$',
        avatarUrl: 'https://picsum.photos/seed/mumbai-kebab/300/300',
        gallery: ['https://picsum.photos/seed/kebab-stall/600/400', 'https://picsum.photos/seed/mughlai-food/600/400'],
        verificationStatus: 'verified',
        availability: { [getFutureDate(3)]: false }, // Closed in 3 days
    },
    {
        id: 'vendor-2',
        name: 'Vaishali',
        location: 'Pune',
        type: 'Restaurant',
        cuisine: ['South Indian', 'Maharashtrian'],
        rating: 4.8,
        reviewCount: 3200,
        priceRange: '$$',
        avatarUrl: 'https://picsum.photos/seed/pune-restaurant/300/300',
        gallery: ['https://picsum.photos/seed/pune-dosa/600/400', 'https://picsum.photos/seed/pune-thali/600/400'],
        verificationStatus: 'verified',
        availability: {},
    },
    {
        id: 'vendor-3',
        name: 'German Bakery',
        location: 'Pune',
        type: 'Cafe',
        cuisine: ['Cafe', 'Desserts', 'Continental'],
        rating: 4.6,
        reviewCount: 1800,
        priceRange: '$$$',
        avatarUrl: 'https://picsum.photos/seed/pune-cafe/300/300',
        gallery: ['https://picsum.photos/seed/pune-pastry/600/400', 'https://picsum.photos/seed/coffee-shop/600/400'],
        verificationStatus: 'verified',
        availability: {},
    },
    {
        id: 'vendor-4',
        name: 'New Famous Pav Bhaji',
        location: 'Nashik',
        type: 'Street Food',
        cuisine: ['Street Food'],
        rating: 4.9,
        reviewCount: 950,
        priceRange: '$',
        avatarUrl: 'https://picsum.photos/seed/nashik-pavbhaji/300/300',
        gallery: ['https://picsum.photos/seed/pav-bhaji/600/400', 'https://picsum.photos/seed/street-food-vendor/600/400'],
        verificationStatus: 'pending',
        availability: {},
    }
];

export const mockStays: Stay[] = [
    {
        id: 'stay-1',
        name: 'The Taj Mahal Palace',
        location: 'Mumbai',
        type: 'Hotel',
        rating: 5.0,
        reviewCount: 5000,
        pricePerNight: 25000,
        amenities: ['Pool', 'Spa', 'Sea View', 'Fine Dining'],
        avatarUrl: 'https://picsum.photos/seed/mumbai-taj-hotel/300/300',
        gallery: ['https://picsum.photos/seed/taj-hotel-exterior/600/400', 'https://picsum.photos/seed/taj-hotel-room/600/400'],
        verificationStatus: 'verified',
        availability: { [getFutureDate(8)]: false, [getFutureDate(9)]: false },
    },
    {
        id: 'stay-2',
        name: 'Verandah by the Valley',
        location: 'Pune',
        type: 'Homestay',
        rating: 4.9,
        reviewCount: 250,
        pricePerNight: 8000,
        amenities: ['Garden', 'Home-cooked Meals', 'Wi-Fi'],
        avatarUrl: 'https://picsum.photos/seed/pune-homestay/300/300',
        gallery: ['https://picsum.photos/seed/homestay-garden/600/400', 'https://picsum.photos/seed/homestay-room/600/400'],
        verificationStatus: 'verified',
        availability: {},
    },
    {
        id: 'stay-3',
        name: 'Beyond by Sula',
        location: 'Nashik',
        type: 'Resort',
        rating: 4.8,
        reviewCount: 900,
        pricePerNight: 12000,
        amenities: ['Vineyard View', 'Pool', 'Wine Tasting'],
        avatarUrl: 'https://picsum.photos/seed/nashik-resort/300/300',
        gallery: ['https://picsum.photos/seed/vineyard-resort/600/400', 'https://picsum.photos/seed/resort-pool/600/400'],
        verificationStatus: 'verified',
        availability: { [getFutureDate(1)]: false },
    },
    {
        id: 'stay-4',
        name: 'Jagtap\'s Farm Stay',
        location: 'Aurangabad',
        type: 'Homestay',
        rating: 4.7,
        reviewCount: 150,
        pricePerNight: 4500,
        amenities: ['Organic Farm', 'Rustic Charm', 'Quiet'],
        avatarUrl: 'https://picsum.photos/seed/aurangabad-farmstay/300/300',
        gallery: ['https://picsum.photos/seed/farm-stay-exterior/600/400', 'https://picsum.photos/seed/farm-stay-room/600/400'],
        verificationStatus: 'pending',
        availability: {},
    },
];


export const mockBookings: Booking[] = [
    {
        id: 'booking-1',
        userId: 'user-1',
        guideId: 'guide-2',
        startDate: getFutureDate(15),
        endDate: getFutureDate(17),
        guests: 2,
        totalPrice: 24000,
        status: BookingStatus.Confirmed,
        pointsEarned: 2400,
    },
    {
        id: 'booking-2',
        userId: 'user-1',
        guideId: 'guide-1',
        startDate: '2024-05-20',
        endDate: '2024-05-21',
        guests: 1,
        totalPrice: 9000,
        status: BookingStatus.Completed,
        pointsEarned: 900,
        hasBeenReviewed: true,
    },
     {
        id: 'booking-3',
        userId: 'user-1',
        guideId: 'guide-4',
        startDate: '2024-03-10',
        endDate: '2024-03-12',
        guests: 4,
        totalPrice: 30400,
        status: BookingStatus.Completed,
        pointsEarned: 3040,
        hasBeenReviewed: false,
    },
     {
        id: 'booking-4', // Booking for the guide to see
        userId: 'user-2',
        guideId: 'guide-1',
        startDate: getFutureDate(20),
        endDate: getFutureDate(22),
        guests: 3,
        totalPrice: 40500,
        status: BookingStatus.Pending,
        pointsEarned: 4050,
    },
    {
        id: 'booking-5',
        userId: 'user-3',
        guideId: 'guide-1',
        startDate: '2024-06-10',
        endDate: '2024-06-11',
        guests: 2,
        totalPrice: 18000,
        status: BookingStatus.Completed,
        pointsEarned: 1800,
        hasBeenReviewed: false,
    },
];

export const mockConversations: Conversation[] = [
    {
        id: 'conv-1',
        userId: 'user-1',
        guideId: 'guide-2', // Aisha Khan
        lastMessageTimestamp: Date.now() - 1000 * 60 * 5, // 5 minutes ago
        unreadCount: 1,
    }
];

export const mockMessages: DirectMessage[] = [
    {
        id: 'msg-1',
        conversationId: 'conv-1',
        senderId: 'user-1',
        text: 'Hi Aisha, we have booked a tour with you for August. Just wanted to confirm the meeting point.',
        timestamp: Date.now() - 1000 * 60 * 10, // 10 minutes ago
    },
    {
        id: 'msg-2',
        conversationId: 'conv-1',
        senderId: 'guide-2',
        text: 'Namaste Priya! Yes, I see your booking. We will meet at the entrance of Shaniwar Wada. Looking forward to it!',
        timestamp: Date.now() - 1000 * 60 * 5, // 5 minutes ago
    }
];

export const mockReviews: Review[] = [
    {
        id: 'review-1',
        guideId: 'guide-1',
        userId: 'user-2', // A different user
        rating: 5,
        comment: 'Rohan was an absolutely fantastic guide! His knowledge of Mumbai street food is incredible. We tasted so many amazing things we would have never found on our own. Highly recommended!',
        createdAt: '2024-05-25T10:00:00Z',
    },
    {
        id: 'review-2',
        guideId: 'guide-1',
        userId: 'user-1', // Priya's review for Rohan
        rating: 5,
        comment: 'My first trip in Mumbai was made special by Rohan. He is very professional and friendly. The Bollywood tour was the highlight!',
        createdAt: '2024-05-22T14:30:00Z',
    },
    {
        id: 'review-3',
        guideId: 'guide-2',
        userId: 'user-3',
        rating: 4,
        comment: 'Aisha is a great guide for trekking. The views were breathtaking. She could be a bit more engaging with stories, but overall a very good experience.',
        createdAt: '2024-06-01T18:00:00Z',
    },
];

// We need some more users for the reviews and admin panel to make sense
export const otherUsers: User[] = [
    {...mockTouristUser, id: 'user-2', name: 'Rahul Verma', avatarUrl: 'https://picsum.photos/seed/tourist-man-1/200/200', role: 'user', status: 'active', redeemedRewardIds: [], hasPendingApplication: false, unlockedGuideIds: [], wishlist: [] },
    {...mockTouristUser, id: 'user-3', name: 'Sneha Reddy', avatarUrl: 'https://picsum.photos/seed/tourist-woman-2/200/200', role: 'user', status: 'active', redeemedRewardIds: [], hasPendingApplication: false, unlockedGuideIds: [], wishlist: [] },
    {...mockTouristUser, id: 'user-4', name: 'Arjun Mehta', avatarUrl: 'https://picsum.photos/seed/tourist-man-2/200/200', role: 'user', status: 'suspended', redeemedRewardIds: [], hasPendingApplication: false, unlockedGuideIds: [], wishlist: [] },
    {...mockTouristUser, id: 'user-5', name: 'Divya Rao', avatarUrl: 'https://picsum.photos/seed/tourist-woman-3/200/200', role: 'user', status: 'active', redeemedRewardIds: [], hasPendingApplication: true, unlockedGuideIds: [], wishlist: [] } // This user has a pending application
];

export const mockNotifications: Notification[] = [
    {
        id: 'notif-1',
        message: 'Your upcoming booking with Aisha Khan is tomorrow!',
        read: false,
        type: 'booking',
        timestamp: Date.now() - 1000 * 60 * 60, // 1 hour ago
    },
    {
        id: 'notif-2',
        message: 'You have a new message from Rohan Patil.',
        read: false,
        type: 'message',
        timestamp: Date.now() - 1000 * 60 * 180, // 3 hours ago
    },
     {
        id: 'notif-3',
        message: 'Welcome to MahaYatri Pro! You now have access to the AI Cost Estimator.',
        read: true,
        type: 'system',
        timestamp: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
    }
];