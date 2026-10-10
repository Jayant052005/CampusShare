/* ==========================================================================
   CampusShare - Initial Seed Data (Empty Start State)
   ========================================================================== */

const INITIAL_UNIVERSITIES = [
  "Stanford University",
  "UC Berkeley",
  "MIT",
  "Harvard University",
  "UT Austin",
  "University of Michigan",
  "NYU",
  "UCLA",
  "University of Washington",
  "Columbia University"
];

const INITIAL_CATEGORIES = [
  { id: "textbooks", name: "Textbooks & Notes", icon: "📚", count: 0 },
  { id: "electronics", name: "Electronics & Tech", icon: "💻", count: 0 },
  { id: "dorm", name: "Dorm Essentials", icon: "🛋️", count: 0 },
  { id: "clothing", name: "Campus Apparel", icon: "👕", count: 0 },
  { id: "services", name: "Tutoring & Services", icon: "🎓", count: 0 },
  { id: "sports", name: "Bikes & Gear", icon: "🚲", count: 0 }
];



const INITIAL_ITEMS = [
  {
    id: "1",
    title: "TI-84 Plus CE Graphing Calculator",
    category: "Electronics",
    type: "sell",
    price: 45,
    originalPrice: 120,
    condition: "Like New",
    description: "TI-84 Plus CE in mint condition with rechargeable battery, USB charging cable, and slide cover. Ideal for calculus, stats, and engineering courses.",
    image: "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=600&q=80",
    sellerId: "usr_alex",
    sellerName: "Alex Chen",
    sellerUniversity: "Stanford University",
    sellerAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
    location: "Engineering Quad",
    postedDate: "2 hours ago",
    status: "active",
    views: 42,
    savedCount: 5
  },
  {
    id: "2",
    title: "CLRS Algorithms 4th Edition",
    category: "Books",
    type: "lend",
    price: 0,
    originalPrice: 90,
    condition: "Good",
    description: "Introduction to Algorithms (4th Edition). Available to lend for 1 semester to any CS student taking algorithms or data structures.",
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80",
    sellerId: "usr_sarah",
    sellerName: "Sarah Jenkins",
    sellerUniversity: "UC Berkeley",
    sellerAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    location: "Main Library",
    postedDate: "5 hours ago",
    status: "active",
    views: 38,
    savedCount: 8
  },
  {
    id: "3",
    title: "Organic Chemistry Lab Kit",
    category: "Lab Equipment",
    type: "donate",
    price: 0,
    originalPrice: 65,
    condition: "Used",
    description: "Complete organic chemistry glassware kit with distillation column, condenser, round bottom flasks, and safety goggles. Donating to juniors!",
    image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80",
    sellerId: "usr_mike",
    sellerName: "Mike Ross",
    sellerUniversity: "MIT",
    sellerAvatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80",
    location: "Chemistry Building",
    postedDate: "Yesterday",
    status: "active",
    views: 55,
    savedCount: 12
  },
  {
    id: "4",
    title: "Tablet",
    category: "Electronics",
    type: "sell",
    price: 150,
    originalPrice: 320,
    condition: "Fair",
    description: "Great for digital note-taking, reading PDFs, and lecture slides. Battery health is at 90%, comes with stylus and protective case.",
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=600&q=80",
    sellerId: "usr_jessica",
    sellerName: "Jessica Taylor",
    sellerUniversity: "NYU",
    sellerAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80",
    location: "Kimmel Student Center",
    postedDate: "1 day ago",
    status: "active",
    views: 64,
    savedCount: 7
  },
  {
    id: "5",
    title: "Academic Books",
    category: "Books",
    type: "exchange",
    price: 30,
    originalPrice: 85,
    condition: "Excellent",
    description: "Set of core textbooks for sophomore engineering. Open to exchange for junior year prep books or similar reference material.",
    image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80",
    sellerId: "usr_david",
    sellerName: "David Kim",
    sellerUniversity: "UCLA",
    sellerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    location: "Ackerman Union",
    postedDate: "2 days ago",
    status: "active",
    views: 29,
    savedCount: 4
  },
  {
    id: "6",
    title: "Hostel Chair",
    category: "Hostel Items",
    type: "sell",
    price: 15,
    originalPrice: 50,
    condition: "Good",
    description: "Comfortable ergonomic study chair with lumbar support and swivel base. Perfect for dorm or hostel study desk.",
    image: "https://images.unsplash.com/photo-1580481077111-9a746522c091?auto=format&fit=crop&w=600&q=80",
    sellerId: "usr_emily",
    sellerName: "Emily Watson",
    sellerUniversity: "UT Austin",
    sellerAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
    location: "Jester Center Dorms",
    postedDate: "3 days ago",
    status: "active",
    views: 47,
    savedCount: 6
  }
];

const INITIAL_USERS = [
  {
    id: "usr_alex",
    name: "Alex Chen",
    email: "alex@stanford.edu",
    university: "Stanford University",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
    verified: true,
    rating: 4.9
  }
];

const INITIAL_MESSAGES = [];
