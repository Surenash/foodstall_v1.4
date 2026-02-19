# Food Stall Platform Quick Reference

## Quick Start Commands

### 1. Setup (First Time)
```bash
chmod +x setup.sh
./setup.sh
```

### 2. Start Backend
```bash
cd backend
npm run dev
```

### 3. Start Mobile App
```bash
cd mobile
npm run android  # or npm run ios
```

### 4. Test API
```bash
# Health check
curl http://localhost:3000/health

# Find nearby stalls (Mumbai)
curl "http://localhost:3000/api/v1/stalls/nearby?lat=19.0760&long=72.8777&radius=5000"
```

## Project Structure

```
food_stall/
├── database/schema.sql          # PostgreSQL + PostGIS schema
├── backend/
│   ├── server.js                # Express + Socket.io server
│   ├── routes/
│   │   ├── stalls.js            # User APIs (nearby, details, reviews)
│   │   └── owner.js             # Owner APIs (status, menu, photos)
│   └── utils/hygieneScore.js    # Hygiene calculation logic
├── mobile/
│   ├── components/StallCard.js  # Stall card with status badge
│   ├── screens/
│   │   ├── OwnerDashboard.js    # Large toggle button for owners
│   │   ├── MapView.js           # Map with stall markers
│   │   ├── StallDetail.js       # Stall info and reviews
│   │   └── ReviewForm.js        # Hygiene review form
│   └── styles/theme.js          # Design system (colors, fonts)
└── README.md                    # Full documentation
```

## Key Features

### User App
- Find stalls on map (sorted by distance)
- Real-time Open/Closed status
- Hygiene score (1-5) with breakdown
- Reviews with hygiene questions
- Filter by cuisine, dietary tags

### Owner App
- One-tap Open/Closed toggle (200px button)
- Auto GPS location update
- Upload hygiene photos (FSSAI)
- Update menu text

## Tech Stack

- **Database:** PostgreSQL + PostGIS (geospatial)
- **Backend:** Node.js + Express + Socket.io
- **Mobile:** React Native
- **Auth:** JWT + OTP (phone number)

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/stalls/nearby` | Find stalls by location |
| GET | `/api/v1/stalls/:id` | Get stall details |
| POST | `/api/v1/stalls/reviews` | Submit review |
| POST | `/api/v1/owner/status` | Update open/closed |
| PUT | `/api/v1/owner/menu` | Update menu |
| POST | `/api/v1/owner/hygiene-proof` | Upload photo |

## Sample Data

The setup script creates:
- **3 users** (2 customers, 1 vendor)
- **2 stalls** in Mumbai (Colaba, Andheri)
- **1 review** with hygiene feedback

## Environment Variables

Edit `backend/.env`:
```env
DB_NAME=foodstall_db
DB_USER=postgres
DB_PASSWORD=your_password
PORT=3000
```

## Troubleshooting

**Database connection error:**
```bash
# Check PostgreSQL is running
brew services start postgresql  # macOS
sudo service postgresql start   # Linux
```

**PostGIS not enabled:**
```bash
psql foodstall_db -c "CREATE EXTENSION postgis;"
```

**Port 3000 already in use:**
Change `PORT=3001` in `backend/.env`

## Resources

- [README.md](README.md) - Full setup guide
- [API_DOCUMENTATION.md](API_DOCUMENTATION.md) - API reference
- [walkthrough.md](walkthrough.md) - Implementation details

## Next Steps

1. Integrate SMS service for OTP
2. Deploy to cloud (AWS/GCP Mumbai)
3. Add more test data
4. Build authentication UI
5. Implement filters and search
