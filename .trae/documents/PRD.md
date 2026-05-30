# ViralVibe - Product Requirements Document

## 1. Product Overview

**ViralVibe** transforms any e-commerce product link into engaging, trend-aware social media promotion videos with just one click.

**Problem Statement:**
- Individual sellers and small businesses struggle to create professional video content for TikTok and social media
- Existing solutions require video editing skills, expensive tools, or significant time investment
- Most sellers lack the resources to stay current with trending formats and sounds

**Target Users:**
- TikTok Shop sellers wanting to create viral promotion content
- Shopee SG sellers expanding to TikTok social commerce
- Small businesses in Singapore/Southeast Asia entering short-video marketing
- Individual creators promoting products on TikTok Shop

**Market Value:**
- Bridges TikTok Shop's explosive growth with easy video content creation
- Reduces video production costs from $50-200 per video to near-zero
- Enables rapid content creation aligned with TikTok trends
- First-mover advantage in Singapore's growing TikTok Shop ecosystem

## 2. Core Features

### 2.1 User Roles

| Role | Registration Method | Core Permissions |
|------|---------------------|------------------|
| User | Optional | Generate videos, use all templates, view history |

**Note:** For hackathon demo, single-user mode with optional local storage for history

### 2.2 Feature Module

1. **Landing Page**: Hero section, value proposition, feature showcase, pricing
2. **Dashboard**: Video generation workspace, history, templates
3. **Generation Studio**: Product link input, video customization, preview
4. **Template Gallery**: Pre-made trending formats, category filters
5. **Profile & Settings**: Account management, preferences

### 2.3 Page Details

#### Landing Page
- **Hero Section**: Animated headline, "Paste Any Link" CTA, trending video previews
- **Features Section**: 3-step workflow visualization (Paste → Generate → Download)
- **Template Showcase**: Curated trending templates with live previews
- **Social Proof**: User testimonials, generated video samples

#### Dashboard
- **Quick Generate Widget**: Prominent link input field
- **Recent Projects**: Grid of generated videos with thumbnails
- **Template Quick Access**: Favorite templates
- **Usage Stats**: Videos generated, credits remaining

#### Generation Studio
- **Product Link Input**: URL field with automatic product info extraction
- **Supported Marketplaces**:
  - **Primary**: TikTok Shop (full feature support)
  - **Secondary**: Shopee Singapore (basic extraction)
- **Video Style Selector**: Entertainment themes (trending, funny, emotional, professional)
- **Duration Control**: 15s / 30s / 60s options
- **Aspect Ratio Toggle**: 9:16 (TikTok), 1:1 (Instagram), 16:9 (YouTube)
- **Trend Integration**: Auto-suggest trending sounds and effects from TikTok
- **Preview Panel**: Real-time video preview
- **Export Options**: Download MP4, share to clipboard, direct TikTok upload

#### Template Gallery
- **Category Filters**: Trending, Product Demo, Unboxing, Transformation, Lifestyle
- **Search Functionality**: By keyword or trend
- **Template Preview**: Animated thumbnails
- **One-Click Use**: Apply template directly to current product

## 3. Core Process

### 3.1 Main User Flow

```
User Pastes TikTok Shop / Shopee SG Link
        ↓
System Extracts Product Info (image, title, price, description, reviews)
        ↓
User Selects Video Style & TikTok Trends
        ↓
AI Generates TikTok-Optimized Video (PixVerse API)
        ↓
Preview & Edit (optional adjustments)
        ↓
Download / Share to TikTok or Other Social Media
```

### 3.2 Video Generation Flow

```
┌─────────────┐
│ Product URL │
└─────────────┘
        ↓
┌────────────────────────┐
│ Extract Product Data   │
│ - Images               │
│ - Description          │
│ - Price & Rating       │
└────────────────────────┘
        ↓
┌────────────────────────┐
│ Fetch Current Trends   │
│ - Trending sounds      │
│ - Popular formats      │
│ - Visual effects       │
└────────────────────────┘
        ↓
┌────────────────────────┐
│ AI Video Generation    │
│ - PixVerse API         │
│ - Style application    │
│ - Trend optimization   │
└────────────────────────┘
        ↓
┌────────────────────────┐
│ Post-Processing         │
│ - Add captions          │
│ - Music overlay        │
│ - Transitions          │
└────────────────────────┘
        ↓
┌─────────────┐
│ Final Video │
└─────────────┘
```

## 4. User Interface Design

### 4.1 Design Style

**Aesthetic Direction:** Playful Neo-Brutalism meets Gen-Z Energy

**Color Palette:**
- Primary: Electric Violet (#8B5CF6)
- Secondary: Hot Pink (#EC4899)
- Accent: Cyan (#06B6D4)
- Background: Deep Navy (#0F172A) with gradient mesh
- Text: Pure White (#FFFFFF)
- Success: Lime Green (#84CC16)

**Typography:**
- Display: Space Grotesk (bold, geometric)
- Body: DM Sans (clean, readable)

**Button Style:**
- Rounded corners (12px radius)
- Gradient fills with glow effects
- Hover: Scale up + shadow enhancement
- Active: Press down effect with darker shade

**Layout Style:**
- Card-based modular design
- Asymmetric layouts with overlapping elements
- Bold typography as visual elements
- Floating UI elements with depth

**Icon/Visual Style:**
- Custom SVG icons with thick strokes
- Animated icons and illustrations
- Gradient fills and glow effects
- Emoji integration for playful tone

### 4.2 Page Design Overview

#### Landing Page
- **Hero Section**: Full-viewport, animated gradient background, floating 3D elements, large headline with text reveal animation
- **Feature Cards**: Glassmorphism cards with hover lift effects
- **Video Showcase**: Masonry grid with hover-to-play
- **CTA Buttons**: Gradient with particle effects on hover

#### Dashboard
- **Sidebar Navigation**: Fixed, collapsible, icon-focused
- **Main Content Area**: Card-based grid layout
- **Quick Actions**: Floating action button for new generation
- **Progress Indicators**: Animated progress bars for video generation

#### Generation Studio
- **Split Layout**: Left (controls), Right (preview)
- **Input Fields**: Floating labels, animated borders
- **Style Selector**: Carousel with preview thumbnails
- **Preview**: Full-height video player with controls
- **Export Panel**: Slide-up drawer with sharing options

### 4.3 Responsiveness

- **Desktop (1200px+)**: Full layout with sidebar navigation
- **Tablet (768px-1199px)**: Collapsed sidebar, stacked panels
- **Mobile (320px-767px)**: Bottom navigation, single column, full-width controls
- Touch optimization for drag-and-drop interactions
- Gesture support for video scrubbing

### 4.4 Animations & Micro-interactions

- **Page Transitions**: Smooth fade with slide effect
- **Button Hover**: Scale 1.05 + glow intensification
- **Card Hover**: Lift up with shadow depth increase
- **Loading States**: Skeleton screens with shimmer effect
- **Video Generation**: Progress ring with percentage, preview thumbnails reveal
- **Success Feedback**: Confetti burst, checkmark animation
- **Scroll Effects**: Parallax backgrounds, reveal on scroll

## 5. Success Metrics

### 5.1 User Engagement
- Video generation completion rate: > 85%
- Average videos per user per week: 5+
- Template usage diversity: 3+ different templates per user

### 5.2 Video Quality
- Average video watch time (TikTok): > 15 seconds
- User satisfaction score: 4.5/5.0
- Viral potential rating (based on trend alignment)

### 5.3 Technical Performance
- Generation time: < 30 seconds for 15s video
- API success rate: > 95%
- Page load time: < 2 seconds
- Mobile responsiveness score: 95+

## 6. Future Roadmap (Post-Hackathon)

- Batch video generation (up to 10 videos at once)
- Direct TikTok/Instagram API integration
- Custom branding overlays
- A/B testing different video variations
- Analytics dashboard for video performance
- Team collaboration features
- Multi-language support
