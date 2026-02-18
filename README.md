# Food Stall Discovery Platform

A dual-sided mobile platform connecting street food enthusiasts with vendors in India, featuring real-time status updates, hygiene transparency, and geospatial discovery.

##  Overview

This MVP enables users to discover nearby food stalls with real-time "Open/Closed" status and hygiene ratings, while empowering vendors with simple tools to manage their online presence.

### Key Features

**User App:**
- 🗺️ Geo-discovery with map and list views
- 🔍 Search by cuisine, dietary tags (Jain, Halal, Veg)
- 🏥 Hygiene transparency with structured reviews
- ⭐ Real-time "Open Now" status indicators
- 🧭 Navigation to stall locations

**Owner App:**
- 🔘 One-tap Open/Closed toggle
- 📍 Automatic GPS location updates
- 📸 Hygiene photo uploads (FSSAI certificates)
- 📝 Simple menu management

## 🏗️ Architecture

### Tech Stack

- **Frontend:** React Native (cross-platform mobile)
- **Backend:** Node.js with Express
- **Database:** PostgreSQL with PostGIS extension
- **Real-time:** Socket.io
- **Maps:** Google Maps API / Mapbox

### Project Structure

```
food_stall/
├── database/
│   └── schema.sql              # PostgreSQL schema with PostGIS
├── backend/
│   ├── server.js               # Main Express server
│   ├── config/
│   │   └── database.js         # PostgreSQL connection pool
│   ├── routes/
│   │   ├── stalls.js           # User-facing stall APIs
│   │   └── owner.js            # Owner management APIs
│   ├── middleware/
│   │   └── auth.js             # JWT & OTP authentication
│   └── utils/
│       └── hygieneScore.js     # Hygiene calculation logic
└── mobile/
    ├── components/
    │   └── StallCard.js        # Stall card component
    ├── screens/
    │   ├── MapView.js          # Map with stall markers
    │   ├── StallDetail.js      # Stall details screen
    │   ├── ReviewForm.js       # Hygiene review form
    │   └── OwnerDashboard.js   # Owner toggle screen
    └── styles/
        └── theme.js            # Design system
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **PostgreSQL** 14+ with PostGIS extension
- **React Native** development environment
  - For Android: Android Studio
  - For iOS: Xcode (macOS only)

### Database Setup

1. **Install PostgreSQL and PostGIS:**

```bash
# macOS (using Homebrew)
brew install postgresql postgis

# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib postgis
```

2. **Create database:**

```bash
createdb foodstall_db
psql foodstall_db -c "CREATE EXTENSION postgis;"
```

3. **Run schema:**

```bash
psql foodstall_db < database/schema.sql
```

This will create:
- Users, Stalls, and Reviews tables
- Spatial indexes for geospatial queries
- Hygiene score calculation function
- Sample seed data (Mumbai coordinates)

### Backend Setup

1. **Install dependencies:**

```bash
cd backend
npm install
```

2. **Configure environment:**

```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. **Start server:**

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

Server runs on `http://localhost:3000`

### Mobile App Setup

1. **Install dependencies:**

```bash
cd mobile
npm install
```

2. **Configure API endpoint:**

Edit the API URLs in screen files to point to your backend server.

3. **Run on Android:**

```bash
npm run android
```

4. **Run on iOS:**

```bash
cd ios && pod install && cd ..
npm run ios
```

## 🔌 API Endpoints

### User APIs

#### GET /api/v1/stalls/nearby
Find stalls near a location using PostGIS.

**Query Parameters:**
- `lat` (required): Latitude
- `long` (required): Longitude
- `radius` (optional): Search radius in meters (default: 1000)
- `open_only` (optional): Filter to open stalls only

**Example:**
```bash
curl "http://localhost:3000/api/v1/stalls/nearby?lat=19.0760&long=72.8777&radius=2000"
```

#### GET /api/v1/stalls/:id
Get detailed stall information.

#### POST /api/v1/stalls/reviews
Submit a review with hygiene feedback.

**Body:**
```json
{
  "stall_id": "uuid",
  "user_id": "uuid",
  "rating": 5,
  "hygiene_score": 5,
  "hygiene_responses": {
    "vendor_wears_gloves": true,
    "filtered_water_visible": true,
    "clean_utensils": true,
    "covered_food_storage": true
  },
  "comment": "Excellent hygiene!"
}
```

### Owner APIs

#### POST /api/v1/owner/status
Update stall open/closed status and location.

**Body:**
```json
{
  "stall_id": "uuid",
  "owner_id": "uuid",
  "is_open": true,
  "location": {
    "lat": 19.0760,
    "long": 72.8777
  }
}
```

#### PUT /api/v1/owner/menu
Update stall menu.

#### POST /api/v1/owner/hygiene-proof
Upload hygiene photos (multipart/form-data).

### Authentication

#### POST /api/v1/auth/request-otp
Request OTP for phone number.

#### POST /api/v1/auth/verify-otp
Verify OTP and get JWT token.

## 📊 Database Schema

### Key Tables

**stalls:**
- Uses `GEOGRAPHY(Point, 4326)` for location (WGS84 coordinates)
- Spatial index with GIST for fast "nearby" queries
- JSONB columns for hygiene badges and flexible data

**reviews:**
- Separate `hygiene_score` from overall `rating`
- JSONB `hygiene_tags` for structured hygiene feedback
- Unique constraint prevents duplicate reviews

### Geospatial Queries

Finding nearby stalls:
```sql
SELECT *, ST_Distance(location, ST_GeogFromText('POINT(long lat)')) as distance
FROM stalls
WHERE ST_DWithin(location, ST_GeogFromText('POINT(long lat)'), 1000)
ORDER BY distance;
```

## 🎨 Design System

Following the **Design Document** specifications:

- **Primary Color:** #FF5733 (Vibrant Orange)
- **Secondary Color:** #FFC300 (Yellow)
- **Status Colors:** Green (#00C853) for Open, Grey (#9E9E9E) for Closed
- **Typography:** Inter or Roboto (Google Fonts)
- **High Contrast:** Optimized for outdoor visibility

## 🧪 Testing

### Test Database Setup

The schema includes sample data:
- 3 test users
- 2 sample stalls in Mumbai (Colaba and Andheri)
- 1 sample review

### Test Nearby Search

```bash
# Find stalls near Colaba, Mumbai
curl "http://localhost:3000/api/v1/stalls/nearby?lat=19.0760&long=72.8777&radius=5000"
```

### Test Owner Status Update

```bash
curl -X POST http://localhost:3000/api/v1/owner/status \
  -H "Content-Type: application/json" \
  -d '{
    "stall_id": "uuid-from-database",
    "owner_id": "uuid-from-database",
    "is_open": true,
    "location": {"lat": 19.0760, "long": 72.8777}
  }'
```

## 🔒 Security Considerations

- ✅ Helmet.js for security headers
- ✅ Rate limiting on API endpoints
- ✅ Input validation and sanitization
- ✅ CORS configuration
- ⚠️ **TODO:** Implement actual SMS OTP service (Twilio/AWS SNS)
- ⚠️ **TODO:** Set up image moderation for hygiene photos
- ⚠️ **TODO:** Configure SSL/TLS for production

## 📱 Mobile App Features

### StallCard Component
- Distance calculation
- Dynamic Open/Closed badge
- Hygiene score indicator
- Rating and price range

### OwnerDashboard Screen
- Large 200px toggle button for outdoor visibility
- High contrast design (bright green/red)
- One-tap status + GPS update
- Real-time Socket.io connection

### ReviewForm Screen
- Star ratings (overall + hygiene)
- 4 hygiene-specific Yes/No questions
- Optional comment field
- Structured review submission

## 🌐 Real-Time Updates

Socket.io events:

**Server emits:**
- `stall_status_update`: When owner changes open/closed status

**Client subscribes:**
```javascript
socket.on('stall_status_update', (data) => {
  // Update UI with new status
  console.log(data.stall_id, data.is_open);
});
```

## 📝 Next Steps

### For Production Deployment

1. **External Services:**
   - Integrate SMS service for OTP authentication
   - Set up cloud storage (AWS S3/Cloudinary) for images
   - Configure Google Maps API key

2. **Infrastructure:**
   - Deploy backend to cloud (AWS/GCP Mumbai region)
   - Set up PostgreSQL managed database
   - Configure CDN for static assets

3. **Compliance:**
   - Implement DPDPA privacy policy
   - Add consent manager for location data
   - Set up photo moderation workflow

4. **Testing:**
   - Unit tests for hygiene score calculation
   - Integration tests for API endpoints
   - E2E tests for user flows

## 📄 License

MIT

## 👥 Authors

Built for the Indian street food market with a focus on hygiene transparency and vendor empowerment.

---

**For questions or support, refer to the documentation files in the project root.**
