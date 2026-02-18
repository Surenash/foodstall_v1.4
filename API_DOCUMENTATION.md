# Food Stall Discovery Platform - API Documentation

## Base URL
```
http://localhost:3000/api/v1
```

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Auth Endpoints

#### Request OTP
```http
POST /auth/request-otp
Content-Type: application/json

{
  "phone_number": "+919876543210"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully"
}
```

#### Verify OTP
```http
POST /auth/verify-otp
Content-Type: application/json

{
  "phone_number": "+919876543210",
  "otp": "123456",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": { "id": "uuid", "phone_number": "+919876543210", "name": "John Doe" },
  "token": "jwt_token_here"
}
```

---

## Stall Endpoints (User-Facing)

### Get Nearby Stalls

Uses PostGIS to find stalls within a radius.

```http
GET /stalls/nearby?lat=19.0760&long=72.8777&radius=2000&open_only=true
```

**Query Parameters:**
- `lat` (required): Latitude (decimal degrees)
- `long` (required): Longitude (decimal degrees)
- `radius` (optional): Search radius in meters (default: 1000)
- `open_only` (optional): Filter to open stalls only (true/false)

**Response:**
```json
{
  "success": true,
  "count": 2,
  "stalls": [
    {
      "id": "uuid",
      "name": "Raju's Famous Chaat Corner",
      "cuisine_type": "Chaat",
      "description": "Best Pani Puri in Mumbai",
      "is_open": true,
      "last_status_update": "2026-01-13T12:30:00Z",
      "price_range": "₹30-₹60",
      "dietary_tags": ["Jain", "Vegan"],
      "hygiene_badges": {
        "fssai_verified": true,
        "owner_declared_hygiene": ["gloves", "filtered_water"]
      },
      "latitude": 19.0760,
      "longitude": 72.8777,
      "distance_meters": 250.5,
      "distance_km": "0.25",
      "review_count": 15,
      "avg_rating": "4.5",
      "hygiene_score": 4.2
    }
  ]
}
```

### Get Stall Details

```http
GET /stalls/:id
```

**Response:**
```json
{
  "success": true,
  "stall": {
    "id": "uuid",
    "name": "Raju's Famous Chaat Corner",
    "cuisine_type": "Chaat",
    "description": "Family business since 1985",
    "menu_text": "Pani Puri: ₹30, Bhel Puri: ₹40",
    "is_open": true,
    "price_range": "₹30-₹60",
    "dietary_tags": ["Jain", "Vegan"],
    "contact_number": "+919876543212",
    "hygiene_badges": { ... },
    "latitude": 19.0760,
    "longitude": 72.8777,
    "avg_rating": "4.5",
    "hygiene_score": 4.2,
    "hygiene_breakdown": {
      "totalReviews": 15,
      "avgUserScore": 4.3,
      "avgTagScore": 85,
      "positiveTagCount": 45,
      "negativeTagCount": 2
    },
    "review_count": 15,
    "owner_name": "Raju",
    "owner_phone": "+919876543212"
  },
  "reviews": [ ... ]
}
```

### Submit Review

```http
POST /stalls/reviews
Content-Type: application/json
Authorization: Bearer <token>

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
  "comment": "Excellent hygiene and delicious food!"
}
```

**Response:**
```json
{
  "success": true,
  "review": { ... },
  "message": "Review submitted successfully"
}
```

**Error (Duplicate Review):**
```json
{
  "error": "You have already reviewed this stall"
}
```

---

## Owner Endpoints

### Update Stall Status

Updates open/closed status and optionally location (for mobile carts).

```http
POST /owner/status
Content-Type: application/json
Authorization: Bearer <token>

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

**Response:**
```json
{
  "success": true,
  "message": "Stall is now OPEN",
  "stall": { ... }
}
```

**Real-time:** Emits Socket.io event `stall_status_update` to all connected clients.

### Update Menu

```http
PUT /owner/menu
Content-Type: application/json
Authorization: Bearer <token>

{
  "stall_id": "uuid",
  "owner_id": "uuid",
  "menu_text": "Pani Puri: ₹30\nBhel Puri: ₹40\nSev Puri: ₹50"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Menu updated successfully",
  "stall": { ... }
}
```

### Upload Hygiene Proof

```http
POST /owner/hygiene-proof
Content-Type: multipart/form-data
Authorization: Bearer <token>

Fields:
- stall_id: uuid
- owner_id: uuid
- photo_type: "fssai" | "setup" | "other"
- photo: <file>
```

**Response:**
```json
{
  "success": true,
  "message": "Hygiene proof uploaded successfully",
  "photo": {
    "filename": "hygiene-1234567890.jpg",
    "path": "uploads/hygiene-photos/hygiene-1234567890.jpg",
    "type": "fssai",
    "uploaded_at": "2026-01-13T12:30:00Z"
  },
  "stall": { ... }
}
```

### Get Owner's Stalls

```http
GET /owner/stalls/:owner_id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "count": 2,
  "stalls": [ ... ]
}
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "error": "Error message",
  "message": "Detailed error description"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing token)
- `403` - Forbidden (invalid token or not authorized)
- `404` - Not Found
- `409` - Conflict (e.g., duplicate review)
- `500` - Internal Server Error

---

## Socket.io Events

### Connect to Server
```javascript
const socket = io('http://localhost:3000');
```

### Events

**stall_status_update** (server → client)
Emitted when a stall owner changes open/closed status.

```javascript
socket.on('stall_status_update', (data) => {
  console.log(data);
  // {
  //   stall_id: "uuid",
  //   is_open: true,
  //   last_status_update: "2026-01-13T12:30:00Z"
  // }
});
```

---

## Hygiene Score Calculation

The hygiene score is calculated using a weighted formula:

**Formula:**
```
finalScore = (avgUserScore * 0.7) + (tagScoreNormalized * 0.3)
```

**Positive Tags (add points):**
- `gloves_used`: +10
- `clean_water`: +10
- `fssai_visible`: +15
- `covered_food`: +8
- `clean_area`: +7
- `clean_utensils`: +8

**Negative Tags (subtract points):**
- `dirty_utensils`: -10
- `no_water_filter`: -8
- `uncovered_food`: -8
- `dirty_area`: -7
- `no_gloves`: -8

---

## Rate Limiting

- **Window:** 15 minutes
- **Max Requests:** 100 per IP

Exceeding the limit returns:
```json
{
  "error": "Too many requests from this IP, please try again later."
}
```

---

## PostGIS Geospatial Functions

The API uses these PostGIS functions internally:

- `ST_GeogFromText('POINT(long lat)')` - Create geography point
- `ST_DWithin(location, point, radius)` - Check if within radius
- `ST_Distance(location1, location2)` - Calculate distance in meters
- `ST_X(geometry)` / `ST_Y(geometry)` - Extract coordinates

---

For more details, see the main [README.md](../README.md).
