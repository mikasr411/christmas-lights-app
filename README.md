# Christmas Lights Estimator

A professional web application for creating Christmas lights mockups and generating estimates.

## Features

- Upload house photos and apply night mode filters
- Measure rooflines with automatic edge detection
- Configure different light types and patterns
- Generate detailed estimates with pricing
- Export PDF estimates and email to clients
- Client portal for viewing estimates

## Tech Stack

- Next.js 14 with App Router
- TypeScript
- TailwindCSS + shadcn/ui
- Prisma + SQLite
- Fabric.js for canvas overlays
- OpenCV.js for image processing
- Sharp for image manipulation
- SendGrid/Resend for email

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Set up the database:
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

See `.env.example` for required environment variables.

## Usage

1. **Upload Photo**: Upload a clear photo of the house front elevation
2. **Apply Night Filter**: Adjust darkness intensity to simulate evening lighting
3. **Measure Rooflines**: Use the measurement tool to draw lines along roof edges
4. **Configure Lights**: Choose light type, pattern, and density
5. **Generate Estimate**: Review pricing and create detailed estimate
6. **Share**: Email estimate to client or export PDF

## API Endpoints

- `POST /api/upload` - Upload photos
- `POST /api/night` - Apply night filter
- `POST /api/measure/suggest` - Get suggested rooflines
- `POST /api/project` - Save/update project
- `POST /api/pdf` - Generate PDF estimate
- `POST /api/email/send` - Send email to client

## License

MIT


