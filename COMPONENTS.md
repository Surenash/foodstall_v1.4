# Food Stall Discovery Platform - Component Reference

## Components Library

### 1. StallCard
**Location:** `mobile/components/StallCard.js`

Displays stall information in card format.

**Props:**
- `stall` (object): Stall data from API
- `onPress` (function): Callback when card is tapped

**Features:**
- Distance display (km)
- Dynamic Open/Closed badge (green/grey)
- Hygiene score with shield icon
- Rating and price range
- Cuisine type

**Usage:**
```jsx
<StallCard
  stall={stallData}
  onPress={() => navigation.navigate('StallDetail', { stallId: stall.id })}
/>
```

---

### 2. LoadingSpinner
**Location:** `mobile/components/LoadingSpinner.js`

Reusable loading indicator component.

**Props:**
- `size` (string): 'small' | 'large' (default: 'large')
- `color` (string): Spinner color (default: primary orange)

**Usage:**
```jsx
<LoadingSpinner size="large" color={theme.colors.primary} />
```

---

## Screens

### 1. LanguageSelection
**Location:** `mobile/screens/LanguageSelection.js`

Onboarding screen for language preference.

**Languages Supported:**
- English
- Hindi (हिन्दी)
- Marathi (मराठी)
- Tamil (தமிழ்)
- Telugu (తెలుగు)
- Bengali (বাংলা)

**Flow:**
1. User selects preferred language
2. Preference saved to AsyncStorage
3. Navigates to main app

---

### 2. MapView
**Location:** `mobile/screens/MapView.js`

Interactive map showing stall locations.

**Features:**
- Google Maps integration
- User location tracking
- Custom markers (color-coded by status)
- Tap marker to view details
- Auto-fetch stalls within 5km radius

**Markers:**
- Green pin = Open stall
- Grey pin = Closed stall

---

### 3. ListView
**Location:** `mobile/screens/ListView.js`

Searchable, filterable list of stalls.

**Features:**
- Search by name, cuisine, description
- Filter modal with:
  - Open Only toggle
  - Dietary tags (Vegetarian, Jain, Halal, Vegan, Non-Veg)
  - Max distance (1km, 2km, 5km, 10km)
- Active filter chips display
- Results count
- Pull to refresh
- Empty state

**Usage:**
```jsx
<ListView navigation={navigation} />
```

---

### 4. StallDetail
**Location:** `mobile/screens/StallDetail.js`

Comprehensive stall information screen.

**Sections:**
- Header with name and status
- Info card (cuisine, price, rating, hygiene score)
- About/description
- Menu with pricing
- Dietary tags
- FSSAI certification badge
- Navigate button (opens Google Maps)
- Write review button
- Reviews list

---

### 5. ReviewForm
**Location:** `mobile/screens/ReviewForm.js`

Structured review submission form.

**Fields:**
- Overall rating (1-5 stars)
- Hygiene score (1-5 stars)
- 4 hygiene questions (Yes/No):
  1. Did vendor wear gloves?
  2. Was filtered water visible?
  3. Were utensils clean?
  4. Was food properly covered?
- Optional comment

**Features:**
- Converts responses to hygiene tags automatically
- Validation before submission
- Success feedback

---

### 6. OwnerDashboard
**Location:** `mobile/screens/OwnerDashboard.js`

Vendor control panel.

**Features:**
- Large 200px toggle button
- High contrast (green "GO ONLINE" / red "GO OFFLINE")
- Automatic GPS location capture
- Real-time Socket.io updates
- Last update timestamp
- Status display

**Props:**
- `route.params.stallId`: Stall ID
- `route.params.ownerId`: Owner ID
- `route.params.stallName`: Stall name

---

## Services

### API Client
**Location:** `mobile/services/api.js`

Centralized API client with organized methods.

**Structure:**
```javascript
import api from './services/api';

// Stalls
const stalls = await api.stalls.getNearby(lat, long, radius, openOnly);
const stall = await api.stalls.getDetails(stallId);
await api.stalls.submitReview(reviewData);

// Owner
await api.owner.updateStatus(stallId, ownerId, isOpen, location);
await api.owner.updateMenu(stallId, ownerId, menuText);
await api.owner.uploadHygieneProof(stallId, ownerId, photoUri, photoType);
const ownerStalls = await api.owner.getStalls(ownerId);

// Auth
await api.auth.requestOTP(phoneNumber);
const response = await api.auth.verifyOTP(phoneNumber, otp, name);
await api.auth.logout();
const user = await api.auth.getCurrentUser();
```

**Features:**
- Axios interceptors for auth tokens
- Automatic error handling
- Token storage in AsyncStorage
- Request/response logging

---

## Navigation

### App Navigator
**Location:** `mobile/App.js`

Main navigation structure with React Navigation.

**Structure:**
```
Stack Navigator
├── LanguageSelection (Onboarding)
├── Main (Tab Navigator)
│   ├── Map (MapView)
│   └── List (ListView)
├── StallDetail
├── ReviewForm
└── OwnerDashboard
```

**Tab Bar:**
- Map icon → Nearby Stalls
- List icon → All Stalls

**Theme:**
- Active tab: Primary orange
- Inactive tab: Grey
- Headers: Orange background, white text

---

## Design System

### Theme
**Location:** `mobile/styles/theme.js`

Centralized design tokens.

**Colors:**
```javascript
colors.primary      // #FF5733 (Vibrant Orange)
colors.secondary    // #FFC300 (Yellow)
colors.statusOpen   // #00C853 (Bright Green)
colors.statusClosed // #9E9E9E (Grey)
```

**Typography:**
```javascript
typography.fontFamily.regular  // Inter-Regular
typography.fontFamily.bold     // Inter-Bold
typography.fontSize.base       // 16
typography.fontSize['2xl']     // 24
```

**Spacing:**
```javascript
spacing.xs  // 4
spacing.sm  // 8
spacing.md  // 16
spacing.lg  // 24
```

**Components:**
```javascript
components.statusBadge.open
components.statusBadge.closed
components.ownerToggle
components.stallCard
components.hygieneBadge(score)
```

---

## Usage Examples

### Complete User Flow
```jsx
// 1. Language selection
<LanguageSelection navigation={navigation} />

// 2. View stalls on map
<MapView navigation={navigation} />

// 3. Filter stalls in list view
<ListView navigation={navigation} />

// 4. View stall details
<StallDetail route={{ params: { stallId } }} navigation={navigation} />

// 5. Submit review
<ReviewForm route={{ params: { stallId } }} navigation={navigation} />
```

### Complete Owner Flow
```jsx
// Owner dashboard
<OwnerDashboard
  route={{
    params: {
      stallId: 'uuid',
      ownerId: 'uuid',
      stallName: 'My Stall'
    }
  }}
  navigation={navigation}
/>
```

### API Integration
```jsx
// Fetch and display stalls
const fetchStalls = async () => {
  const data = await api.stalls.getNearby(19.0760, 72.8777, 5000);
  setStalls(data.stalls);
};

// Submit review
const submitReview = async () => {
  await api.stalls.submitReview({
    stall_id: stallId,
    user_id: userId,
    rating: 5,
    hygiene_score: 5,
    hygiene_responses: { ... },
    comment: 'Great!'
  });
};

// Update status
const toggleStatus = async () => {
  await api.owner.updateStatus(stallId, ownerId, true, {
    lat: 19.0760,
    long: 72.8777
  });
};
```

---

## File Structure

```
mobile/
├── App.js                          # Main navigation
├── package.json                    # Dependencies
├── components/
│   ├── StallCard.js                # Stall card component
│   └── LoadingSpinner.js           # Loading indicator
├── screens/
│   ├── LanguageSelection.js        # Onboarding
│   ├── MapView.js                  # Map screen
│   ├── ListView.js                 # List with filters
│   ├── StallDetail.js              # Detail screen
│   ├── ReviewForm.js               # Review submission
│   └── OwnerDashboard.js           # Owner toggle
├── services/
│   └── api.js                      # API client
└── styles/
    └── theme.js                    # Design system
```

---

## Best Practices

1. **Always use theme constants** instead of hardcoded values
2. **Import API methods** from services/api.js
3. **Handle loading states** with LoadingSpinner
4. **Validate user input** before API calls
5. **Show error feedback** to users
6. **Use navigation prop** for screen transitions
7. **Follow component prop types** as documented

---

For full API documentation, see [API_DOCUMENTATION.md](../API_DOCUMENTATION.md)
