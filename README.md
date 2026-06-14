# SlimEats — The Perfect Scroll-Animated Riceball Experience

A modern, high-performance scroll-driven Japanese riceball landing page built with Vite, Vanilla CSS, Tailwind, and HTML5 Canvas.

![SlimEats Mockup](public/frames/ezgif-frame-120.jpg)

## 🍣 Features
- **High-Definition 3D Scroll Animation**: Interactive, performance-optimized 240-frame sequence rendered smoothly on a `<canvas>` element using requestAnimationFrame and linear interpolation (lerp).
- **Premium Dark/Light Design System**: Tailored HSL color palette, custom Outfit/Inter typography, and glassmorphism elements.
- **Responsive Canvas Engine**: Tailored dynamic viewport aspect-ratio scaling (cover crop) supporting Retina and high-DPI screens.
- **Tailwind CSS Integration**: Dynamic interactive buttons, grids, hover micro-animations, and form validation.
- **Vercel-Ready**: Pre-configured build pipelines for instantaneous edge deployments.

---

## 🚀 Local Development

Follow these steps to run the project locally:

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

3. **Build for Production**:
   ```bash
   npm run build
   ```
   This generates compiled, minified assets in the `dist` directory.

---

## ⚡ Deploying to Vercel

This project is fully optimized and ready to deploy on **Vercel** with zero-configuration required.

### Option 1: Import GitHub Repository (Recommended)
1. Go to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New** > **Project**.
3. Import your GitHub repository: `first-website`.
4. Vercel will automatically detect the **Vite** framework preset:
   - **Build Command**: `npm run build` (or `vite build`)
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. Click **Deploy**. Your site will be live on a production-ready global CDN in seconds!

### Option 2: Deploy via Vercel CLI
If you prefer deploying via terminal:
1. Install the Vercel CLI globally:
   ```bash
   npm install -g vercel
   ```
2. Run the deployment command from the project root:
   ```bash
   vercel
   ```
3. Follow the CLI prompts to deploy your project.
