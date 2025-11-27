# FitTrack - Fitness Tracking PWA

A comprehensive fitness tracking Progressive Web App built with Next.js, React, SQLite, and a bold brutalist design aesthetic.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## Features

- 🏋️ **Workout Logging** - Track exercises, sets, reps, and weight
- 📚 **Exercise Library** - 40+ pre-loaded exercises with search and filtering
- 📅 **Calendar View** - Visual workout history with monthly navigation
- 📊 **Progress Dashboard** - Charts for weight progression and training volume
- 🎯 **Goal Setting** - Create and track fitness goals with progress bars
- 📏 **Body Measurements** - Track weight, body fat %, and measurements
- 🍎 **Nutrition Tracking** - Log meals with calorie and macro totals
- 🎨 **Brutalist Design** - Bold typography, high contrast, raw aesthetic
- 📱 **PWA Support** - Installable on iOS/Android devices
- 🐳 **Docker Ready** - Multi-architecture Docker images

## Quick Start

### Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Docker

```bash
# Build Docker image
docker build -t fitness-app .

# Run container
docker run -p 3000:3000 -v fitness-db:/app/db fitness-app

# Or use Docker Compose
docker-compose up -d
```

See [DOCKER.md](./DOCKER.md) for detailed Docker deployment instructions.

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **UI Library**: React 19
- **Language**: TypeScript
- **Database**: SQLite (better-sqlite3)
- **Charts**: Recharts
- **PWA**: next-pwa
- **Styling**: Custom CSS with brutalist design system
- **Date Handling**: date-fns

## Project Structure

```
fitness-app/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── exercises/         # Exercise library page
│   ├── goals/             # Goals page
│   ├── nutrition/         # Nutrition tracking page
│   ├── progress/          # Progress dashboard
│   ├── workouts/          # Workout logging page
│   └── page.tsx           # Homepage
├── components/            # React components
├── db/                    # Database schema and files
├── lib/                   # Utilities and types
├── public/                # Static assets
└── .github/workflows/     # CI/CD workflows
```

## GitHub Actions & DockerHub

This project includes automated Docker image builds and publishing to DockerHub.

### Setup

1. Create a DockerHub account at [hub.docker.com](https://hub.docker.com)
2. Create an access token in DockerHub settings
3. Add GitHub secrets:
   - `DOCKERHUB_USERNAME`: Your DockerHub username
   - `DOCKERHUB_TOKEN`: Your DockerHub access token

### Workflow

The GitHub Actions workflow automatically:

- Builds multi-architecture images (amd64, arm64)
- Pushes to DockerHub on main branch commits
- Creates version tags for releases
- Caches layers for faster builds

See [.github/workflows/docker-publish.yml](./.github/workflows/docker-publish.yml) for details.

## Database

The app uses SQLite with the following tables:

- `users` - User accounts
- `exercises` - Exercise library (40+ pre-seeded)
- `workouts` - Workout sessions
- `workout_exercises` - Exercise details
- `goals` - Fitness goals
- `body_measurements` - Body tracking
- `nutrition_foods` - Food database (10+ pre-seeded)
- `nutrition_logs` - Daily food intake

Database is automatically initialized with seed data on first run.

## Design System

### Brutalist Aesthetic

- **Typography**: Courier New monospace, oversized headings
- **Colors**: Black/white with neon green accent (#00ff00)
- **Borders**: Thick 3px borders everywhere
- **Layout**: Geometric grids, asymmetric compositions
- **No rounded corners**: Sharp, angular design
- **Raw aesthetic**: Exposed borders, minimal decoration

### Mobile Responsive

- Touch-friendly button sizes
- Responsive grid layouts
- Optimized typography scaling
- PWA installable on iOS/Android

## API Routes

All API routes are located in `/app/api/`:

- `GET/POST/PUT/DELETE /api/workouts` - Workout management
- `GET/POST/DELETE /api/exercises` - Exercise library
- `GET/POST/PUT/DELETE /api/goals` - Goal tracking
- `GET/POST/DELETE /api/measurements` - Body measurements
- `GET/POST/DELETE /api/nutrition` - Nutrition logs
- `GET/POST /api/foods` - Food database

## Environment Variables

```bash
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0
```

## Development

```bash
# Install dependencies
npm install

# Run dev server with hot reload
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Lint code
npm run lint
```

## Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

### Docker

See [DOCKER.md](./DOCKER.md) for comprehensive Docker deployment guide.

### Manual

```bash
npm run build
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Charts powered by [Recharts](https://recharts.org/)
- PWA support via [next-pwa](https://github.com/shadowwalker/next-pwa)
- Database with [better-sqlite3](https://github.com/WiseLibs/better-sqlite3)

## Support

For issues and questions, please open an issue on GitHub.

---

**Track your gains. Own your progress. 💪**
