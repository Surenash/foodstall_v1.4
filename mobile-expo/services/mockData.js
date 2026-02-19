// Comprehensive Mock Data for Standalone Demo

export const MOCK_STALLS = [
    {
        id: 1,
        name: "Raju's Famous Chaat",
        cuisine_type: "Indian Street Food",
        description: "The most authentic Pani Puri and Sev Puri in the neighborhood. Serving standardized hygiene-checked street food since 1995. Our secret spice mix is homemade.",
        latitude: 19.0760,
        longitude: 72.8777,
        is_open: true,
        bg_image: "https://images.unsplash.com/photo-1513639776629-6b61ee14a60b?w=800&q=80",
        distance_km: 0.2,
        price_range: "₹20 - ₹60",
        rating: 4.8,
        reviews_count: 128,
        dietary_tags: ["Vegetarian", "Vegan"],
        menu: [
            { id: 101, name: "Pani Puri", price: 30, is_veg: true, description: "6 pcs of crispy puris with spicy mint water" },
            { id: 102, name: "Sev Puri", price: 40, is_veg: true, description: "Flat puris topped with potatoes, onions and sev" },
            { id: 103, name: "Dahi Batata Puri", price: 50, is_veg: true, description: "Use fresh yogurt" },
            { id: 104, name: "Ragda Pattice", price: 45, is_veg: true },
        ],
        reviews: [
            { id: 201, user: "Amit K.", rating: 5, comment: "Crispy puris and spicy pani! Loved it.", date: "2 days ago", hygiene_score: 5 },
            { id: 202, user: "Sneha P.", rating: 4, comment: "Great taste but a bit crowded.", date: "1 week ago", hygiene_score: 4 },
            { id: 203, user: "John D.", rating: 5, comment: "Very clean for a street stall. Gloves used.", date: "2 weeks ago", hygiene_score: 5 }
        ]
    },
    {
        id: 2,
        name: "Mumbai Sandwich Corner",
        cuisine_type: "Sandwiches",
        description: "Loaded grilling sandwiches with cheese and special green chutney. Famous for our 'Bahubali Sandwich'.",
        latitude: 19.0770,
        longitude: 72.8780,
        is_open: true,
        bg_image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&q=80",
        distance_km: 0.5,
        price_range: "₹50 - ₹150",
        rating: 4.5,
        reviews_count: 85,
        dietary_tags: ["Vegetarian", "Jain"],
        menu: [
            { id: 105, name: "Veg Grill Sandwich", price: 60, is_veg: true },
            { id: 106, name: "Cheese Chilli Toast", price: 50, is_veg: true },
            { id: 107, name: "Bombay Masala Toast", price: 45, is_veg: true },
            { id: 108, name: "Paneer Tandoori Sandwich", price: 80, is_veg: true }
        ],
        reviews: [
            { id: 204, user: "Rahul M.", rating: 5, comment: "The chutney is amazing.", date: "3 days ago" }
        ]
    },
    {
        id: 3,
        name: "Dosawala Brothers",
        cuisine_type: "South Indian",
        description: "Crispy benne dosas, soft idlis, and crisp vadas served with coconut chutney and hot sambar.",
        latitude: 19.0750,
        longitude: 72.8760,
        is_open: true,
        bg_image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&q=80",
        distance_km: 0.8,
        price_range: "₹40 - ₹100",
        rating: 4.2,
        reviews_count: 210,
        dietary_tags: ["Vegetarian"],
        menu: [
            { id: 109, name: "Masala Dosa", price: 50, is_veg: true },
            { id: 110, name: "Idli Sambar", price: 40, is_veg: true },
            { id: 111, name: "Medu Vada", price: 45, is_veg: true },
            { id: 112, name: "Mysore Masala Dosa", price: 70, is_veg: true }
        ],
        reviews: [
            { id: 205, user: "Priya S.", rating: 4, comment: "Good breakfast spot.", date: "1 day ago" }
        ]
    },
    {
        id: 4,
        name: "Burger & Fries Hub",
        cuisine_type: "Fast Food",
        description: "Juicy veggie and chicken burgers with peri-peri fries. Open late night.",
        latitude: 19.0780,
        longitude: 72.8790,
        is_open: false,
        bg_image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&q=80",
        distance_km: 1.2,
        price_range: "₹70 - ₹200",
        rating: 4.0,
        reviews_count: 56,
        dietary_tags: ["Non-Veg", "Halal"],
        menu: [
            { id: 113, name: "Veggie Burger", price: 80, is_veg: true },
            { id: 114, name: "Chicken Burger", price: 120, is_veg: false },
            { id: 115, name: "Peri Peri Fries", price: 90, is_veg: true }
        ],
        reviews: []
    },
    {
        id: 5,
        name: "Chai Tapri",
        cuisine_type: "Beverages",
        description: "Masala Chai, Bun Maska and hot talks. The perfect evening spot.",
        latitude: 19.0740,
        longitude: 72.8750,
        is_open: true,
        bg_image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&q=80",
        distance_km: 0.1,
        price_range: "₹10 - ₹40",
        rating: 4.9,
        reviews_count: 340,
        dietary_tags: ["Vegetarian"],
        menu: [
            { id: 116, name: "Masala Chai", price: 15, is_veg: true },
            { id: 117, name: "Bun Maska", price: 25, is_veg: true },
            { id: 118, name: "Special Tea", price: 20, is_veg: true }
        ],
        reviews: [
            { id: 206, user: "Vikram R.", rating: 5, comment: "Best chai in town!", date: "Today" }
        ]
    }
];

export const MOCK_OWNER = {
    id: 1,
    name: "Raju",
    stall_name: "Raju's Famous Chaat",
    is_open: true,
    location: {
        latitude: 19.0760,
        longitude: 72.8777
    }
};

export const MOCK_USER = {
    id: 1,
    name: "Demo User",
    mobile: "9999999999",
    email: "demo@foodstall.com",
    role: "user"
};
