import { User, Guide, Booking, BookingStatus, Conversation, DirectMessage, Review } from '../types';

export const mockTouristUser: User = {
  id: 'user-1',
  name: 'Priya Sharma',
  email: 'priya.sharma@example.com',
  avatarUrl: 'https://picsum.photos/seed/priya/200/200',
  preferences: ['Historical Sites', 'Local Cuisine', 'Nature Walks'],
  emergencyContact: {
    name: 'Anil Sharma',
    phone: '+91 98765 43210',
  },
  isPro: false,
  points: 3940,
  unlockedGuideIds: ['guide-2'],
  role: 'user',
};

export const mockGuideUser: User = {
    id: 'guide-1', // Corresponds to Rohan Patil
    name: 'Rohan Patil',
    email: 'rohan.patil@example.com', // Using a real-world-like email for lookup
    avatarUrl: 'https://picsum.photos/seed/rohan/200/200',
    preferences: [],
    emergencyContact: { name: 'Support', phone: '123-456-7890' },
    isPro: true,
    points: 0,
    unlockedGuideIds: [],
    role: 'guide',
};

export const mockAdminUser: User = {
  id: 'admin-1',
  name: 'Admin User',
  email: 'admin@example.com', // Using a real-world-like email for lookup
  avatarUrl: 'https://picsum.photos/seed/admin/200/200',
  preferences: [],
  emergencyContact: { name: 'Support', phone: '123-456-7890' },
  isPro: true,
  points: 0,
  unlockedGuideIds: [],
  role: 'admin',
};

// Array of all user profiles for easy lookup after authentication
export const mockUserProfiles: User[] = [mockTouristUser, mockGuideUser, mockAdminUser];

// Function to find a user profile by email (simulating a DB lookup)
export const getUserProfileByEmail = (email: string): User | undefined => {
    // In a real app, you might need to normalize emails (e.g., toLowerCase)
    return mockUserProfiles.find(user => user.email.toLowerCase() === email.toLowerCase());
};


export const mockGuides: Guide[] = [
  {
    id: 'guide-1',
    name: 'Rohan Patil',
    location: 'Mumbai',
    avatarUrl: 'https://picsum.photos/seed/rohan/300/300',
    rating: 4.9,
    reviewCount: 124,
    languages: ['English', 'Hindi', 'Marathi'],
    specialties: ['Street Food', 'Bollywood Tours', 'History'],
    bio: 'Born and raised in Mumbai, I know every nook and cranny of this vibrant city. Let me show you the real Mumbai, from hidden food gems to the glamour of Bollywood.',
    pricePerDay: 4500,
    verificationStatus: 'verified',
    gallery: ['https://picsum.photos/seed/mumbai1/600/400', 'https://picsum.photos/seed/mumbai2/600/400', 'https://picsum.photos/seed/mumbai3/600/400'],
    contactInfo: {
      phone: '+91 98200 98200',
      email: 'rohan.patil@guides.mahayatri.com'
    },
    contactUnlockPrice: 250,
  },
  {
    id: 'guide-2',
    name: 'Aisha Khan',
    location: 'Pune',
    avatarUrl: 'https://picsum.photos/seed/aisha/300/300',
    rating: 4.8,
    reviewCount: 98,
    languages: ['English', 'Hindi'],
    specialties: ['Trekking', 'Forts', 'Cultural Heritage'],
    bio: 'An avid trekker and history enthusiast, I specialize in tours around Pune, exploring the majestic forts of the Sahyadri mountains and the rich Maratha history.',
    pricePerDay: 4000,
    verificationStatus: 'verified',
    gallery: ['https://picsum.photos/seed/pune1/600/400', 'https://picsum.photos/seed/pune2/600/400', 'https://picsum.photos/seed/pune3/600/400'],
     contactInfo: {
      phone: '+91 98900 98900',
      email: 'aisha.khan@guides.mahayatri.com'
    },
    contactUnlockPrice: 200,
  },
  {
    id: 'guide-3',
    name: 'Vikram Singh',
    location: 'Aurangabad',
    avatarUrl: 'https://picsum.photos/seed/vikram/300/300',
    rating: 4.9,
    reviewCount: 150,
    languages: ['English', 'Hindi', 'Marathi'],
    specialties: ['Ajanta & Ellora Caves', 'Mughal History', 'Archaeology'],
    bio: 'Explore the timeless wonders of Ajanta and Ellora with a certified archaeologist. I provide in-depth tours that bring ancient history to life.',
    pricePerDay: 5500,
    verificationStatus: 'verified',
    gallery: ['https://picsum.photos/seed/caves1/600/400', 'https://picsum.photos/seed/caves2/600/400', 'https://picsum.photos/seed/caves3/600/400'],
     contactInfo: {
      phone: '+91 99220 99220',
      email: 'vikram.singh@guides.mahayatri.com'
    },
    contactUnlockPrice: 300,
  },
  {
    id: 'guide-4',
    name: 'Sunita Gawde',
    location: 'Nashik',
    avatarUrl: 'https://picsum.photos/seed/sunita/300/300',
    rating: 4.7,
    reviewCount: 75,
    languages: ['English', 'Marathi'],
    specialties: ['Vineyard Tours', 'Spiritual Sites', 'Local Cuisine'],
    bio: 'Discover Nashik, the wine capital of India! I offer exclusive tours of the best vineyards, combined with visits to sacred temples and delicious local food experiences. I have submitted all my documents for verification.',
    pricePerDay: 3800,
    verificationStatus: 'pending',
    gallery: ['https://picsum.photos/seed/nashik1/600/400', 'https://picsum.photos/seed/nashik2/600/400', 'https://picsum.photos/seed/nashik3/600/400'],
     contactInfo: {
      phone: '+91 98600 98600',
      email: 'sunita.gawde@guides.mahayatri.com'
    },
    contactUnlockPrice: 150,
  },
];

export const mockBookings: Booking[] = [
    {
        id: 'booking-1',
        userId: 'user-1',
        guideId: 'guide-2',
        startDate: '2024-08-15',
        endDate: '2024-08-17',
        guests: 2,
        totalPrice: 24000,
        status: BookingStatus.Upcoming,
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
        startDate: '2024-09-01',
        endDate: '2024-09-03',
        guests: 3,
        totalPrice: 40500,
        status: BookingStatus.Upcoming,
        pointsEarned: 4050,
    }
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

// We need some more users for the reviews to make sense
export const otherUsers: User[] = [
    {...mockTouristUser, id: 'user-2', name: 'Rahul Verma', avatarUrl: 'https://picsum.photos/seed/rahul/200/200', role: 'user'},
    {...mockTouristUser, id: 'user-3', name: 'Sneha Reddy', avatarUrl: 'https://picsum.photos/seed/sneha/200/200', role: 'user'}
];