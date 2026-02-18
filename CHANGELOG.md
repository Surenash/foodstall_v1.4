# Food Stall Discovery Platform - Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [1.0.0] - 2026-01-13

### MVP Release

#### Database Layer
- **Added** PostgreSQL schema with PostGIS extension
- **Added** Users table with JSONB preferences
- **Added** Stalls table with Geography(Point) for location
- **Added** Reviews table with hygiene-specific fields
- **Added** Spatial indexes for fast geospatial queries
- **Added** `calculate_hygiene_score()` database function
- **Added** Sample seed data (3 users, 2 stalls, 1 review)

#### Backend API
- **Added** Express.js server with Socket.io
- **Added** GET `/api/v1/stalls/nearby` - Geospatial stall search
- **Added** GET `/api/v1/stalls/:id` - Stall details
- **Added** POST `/api/v1/stalls/reviews` - Review submission
- **Added** POST `/api/v1/owner/status` - Status updates with GPS
- **Added** PUT `/api/v1/owner/menu` - Menu management
- **Added** POST `/api/v1/owner/hygiene-proof` - Photo uploads
- **Added** OTP-based authentication (placeholder)
- **Added** JWT token generation
- **Added** Hygiene score calculation utility
- **Added** Rate limiting (100 requests/15 min)
- **Added** Security headers (Helmet.js)
- **Added** CORS configuration
- **Added** Real-time Socket.io events

#### Mobile Application
- **Added** React Navigation setup (Stack + Tabs)
- **Added** Language selection onboarding (6 languages)
- **Added** MapView with Google Maps integration
- **Added** ListView with advanced filtering
- **Added** StallCard component
- **Added** StallDetail screen
- **Added** ReviewForm with hygiene questions
- **Added** OwnerDashboard with 200px toggle button
- **Added** Centralized API client (axios)
- **Added** Design system (theme.js)
- **Added** Search functionality
- **Added** Filter modal (dietary tags, distance, open status)
- **Added** Loading spinner component

#### Documentation
- **Added** README.md - Setup guide
- **Added** API_DOCUMENTATION.md - API reference
- **Added** COMPONENTS.md - Component library
- **Added** DEPLOYMENT.md - Production deployment guide
- **Added** QUICK_START.md - Quick reference
- **Added** PROJECT_README.md - Overview

#### DevOps & Deployment
- **Added** Docker configuration for backend
- **Added** docker-compose.yml with PostgreSQL PostGIS
- **Added** setup.sh automated setup script
- **Added** .gitignore files
- **Added** Example tests (Jest)
- **Added** Environment variable templates

#### Design System
- **Added** Primary color: #FF5733 (Vibrant Orange)
- **Added** Status colors: Green (#00C853), Grey (#9E9E9E)
- **Added** Typography: Inter/Roboto fonts
- **Added** High-contrast styling for outdoor visibility
- **Added** Large touch targets for accessibility

---

## Future Enhancements (Roadmap)

### v1.1 (Planned)
- [ ] SMS OTP integration (Twilio/AWS SNS)
- [ ] AWS S3 integration for photo storage
- [ ] Payment integration
- [ ] Advanced search with Elasticsearch
- [ ] Push notifications
- [ ] Analytics dashboard for owners

### v1.2 (Planned)
- [ ] Multi-language content support
- [ ] Voice search
- [ ] AR navigation to stalls
- [ ] Social sharing features
- [ ] Loyalty program
- [ ] Promotional offers system

### v2.0 (Future)
- [ ] ML-based stall recommendations
- [ ] Chatbot support
- [ ] Video reviews
- [ ] Live streaming from stalls
- [ ] Integration with food delivery services

---

## Known Issues

- OTP authentication requires SMS service integration
- Image uploads stored locally (needs cloud storage)
- No automated backup system yet
- Limited to Mumbai coordinates in sample data

---

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## Versioning

We use [SemVer](http://semver.org/) for versioning.

---

## Support

For issues and questions:
- Create GitHub issue
- Email: support@foodstalldiscovery.com (placeholder)

---

**Version 1.0.0 - MVP Complete ✅**
