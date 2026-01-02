# Mobile Standards & Guidelines

## Overview

This document defines mobile standards for the DGIHub platform, focusing on dark mode support, thumb-friendly navigation, and low-bandwidth optimization.

## 1. Dark Mode Support

### 1.1 Color Scheme

**Light Mode:**
```css
:root {
  --bg-primary: #FFFFFF;
  --bg-secondary: #F9FAFB;
  --bg-tertiary: #F3F4F6;
  --text-primary: #111827;
  --text-secondary: #6B7280;
  --text-tertiary: #9CA3AF;
  --border: #E5E7EB;
  --accent: #2563EB;
  --accent-hover: #1D4ED8;
  --success: #10B981;
  --warning: #F59E0B;
  --error: #EF4444;
}
```

**Dark Mode:**
```css
[data-theme="dark"] {
  --bg-primary: #111827;
  --bg-secondary: #1F2937;
  --bg-tertiary: #374151;
  --text-primary: #F9FAFB;
  --text-secondary: #D1D5DB;
  --text-tertiary: #9CA3AF;
  --border: #4B5563;
  --accent: #3B82F6;
  --accent-hover: #2563EB;
  --success: #34D399;
  --warning: #FBBF24;
  --error: #F87171;
}
```

### 1.2 Implementation

**System Preference Detection:**
```javascript
// Detect system preference
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

// Set initial theme
if (prefersDark) {
  document.documentElement.setAttribute('data-theme', 'dark');
} else {
  document.documentElement.setAttribute('data-theme', 'light');
}

// Listen for changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
});
```

**Manual Toggle:**
```javascript
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
}

// Load saved preference
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
  document.documentElement.setAttribute('data-theme', savedTheme);
}
```

### 1.3 Component Dark Mode Styles

**Card Component:**
```css
.card {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border);
  color: var(--text-primary);
  transition: background-color 0.2s, border-color 0.2s;
}

.card:hover {
  background-color: var(--bg-tertiary);
}
```

**Button Component:**
```css
.btn-primary {
  background-color: var(--accent);
  color: white;
  border: none;
}

.btn-primary:hover {
  background-color: var(--accent-hover);
}

[data-theme="dark"] .btn-primary {
  background-color: var(--accent);
}
```

## 2. Thumb-Friendly Navigation

### 2.1 Touch Target Sizes

**Minimum Sizes:**
- Primary actions: 48x48px (iOS), 48x48px (Android)
- Secondary actions: 44x44px
- Text links: 44x44px minimum height
- Icon buttons: 48x48px
- Bottom navigation items: 56x56px

**Spacing:**
- Minimum spacing between touch targets: 8px
- Preferred spacing: 16px

### 2.2 Thumb Zone Optimization

**Screen Zones:**
```
┌─────────────────────────┐
│  Hard to Reach          │ Top 25%
│  (Avoid primary actions) │
├─────────────────────────┤
│  Easy to Reach          │ Middle 50%
│  (Primary actions here)  │
├─────────────────────────┤
│  Easy to Reach          │ Bottom 25%
│  (Navigation, actions)  │
└─────────────────────────┘
```

**Navigation Placement:**
- Bottom navigation bar (mobile)
- Floating action button (FAB) in bottom-right
- Primary actions in bottom 50% of screen
- Secondary actions can be in top area

### 2.3 Bottom Navigation

**Design:**
```css
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 64px;
  background-color: var(--bg-secondary);
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 1000;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 64px;
  min-height: 64px;
  padding: 8px 16px;
  color: var(--text-secondary);
  text-decoration: none;
  transition: color 0.2s;
}

.nav-item.active {
  color: var(--accent);
}

.nav-item-icon {
  width: 24px;
  height: 24px;
  margin-bottom: 4px;
}

.nav-item-label {
  font-size: 12px;
  font-weight: 500;
}
```

**HTML Structure:**
```html
<nav class="bottom-nav">
  <a href="/" class="nav-item active">
    <svg class="nav-item-icon">...</svg>
    <span class="nav-item-label">Home</span>
  </a>
  <a href="/training" class="nav-item">
    <svg class="nav-item-icon">...</svg>
    <span class="nav-item-label">Training</span>
  </a>
  <a href="/credentials" class="nav-item">
    <svg class="nav-item-icon">...</svg>
    <span class="nav-item-label">Credentials</span>
  </a>
  <a href="/profile" class="nav-item">
    <svg class="nav-item-icon">...</svg>
    <span class="nav-item-label">Profile</span>
  </a>
</nav>
```

### 2.4 Floating Action Button (FAB)

**Design:**
```css
.fab {
  position: fixed;
  bottom: 80px; /* Above bottom nav */
  right: 16px;
  width: 56px;
  height: 56px;
  border-radius: 28px;
  background-color: var(--accent);
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  transition: transform 0.2s, box-shadow 0.2s;
}

.fab:active {
  transform: scale(0.95);
}

[data-theme="dark"] .fab {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}
```

## 3. Low-Bandwidth Optimization

### 3.1 Image Optimization

**Lazy Loading:**
```html
<img 
  src="placeholder.jpg" 
  data-src="image.jpg" 
  loading="lazy"
  alt="Description"
  class="lazy-image"
/>
```

```javascript
// Intersection Observer for lazy loading
const imageObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      img.classList.remove('lazy-image');
      observer.unobserve(img);
    }
  });
});

document.querySelectorAll('.lazy-image').forEach(img => {
  imageObserver.observe(img);
});
```

**Responsive Images:**
```html
<picture>
  <source 
    media="(max-width: 768px)" 
    srcset="image-small.webp 1x, image-small@2x.webp 2x"
    type="image/webp"
  />
  <source 
    media="(max-width: 768px)" 
    srcset="image-small.jpg 1x, image-small@2x.jpg 2x"
    type="image/jpeg"
  />
  <source 
    srcset="image-large.webp 1x, image-large@2x.webp 2x"
    type="image/webp"
  />
  <img 
    src="image-large.jpg" 
    srcset="image-large.jpg 1x, image-large@2x.jpg 2x"
    alt="Description"
    loading="lazy"
  />
</picture>
```

**Image Formats:**
- Use WebP with JPEG fallback
- Compress images: 80% quality for photos, 90% for graphics
- Serve appropriate sizes based on viewport

### 3.2 Code Splitting

**Route-based Splitting:**
```javascript
// React Router example
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const Home = lazy(() => import('./pages/Home'));
const Credentials = lazy(() => import('./pages/Credentials'));
const Training = lazy(() => import('./pages/Training'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/credentials" element={<Credentials />} />
          <Route path="/training" element={<Training />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
```

**Component-based Splitting:**
```javascript
// Lazy load heavy components
const CredentialViewer = lazy(() => import('./components/CredentialViewer'));
const Chart = lazy(() => import('./components/Chart'));
```

### 3.3 Data Fetching Optimization

**Pagination:**
```javascript
async function loadCredentials(page = 1, limit = 20) {
  const response = await fetch(
    `/api/v1/credentials?page=${page}&limit=${limit}`
  );
  return response.json();
}

// Infinite scroll
const [credentials, setCredentials] = useState([]);
const [page, setPage] = useState(1);
const [hasMore, setHasMore] = useState(true);

const loadMore = async () => {
  if (!hasMore) return;
  
  const data = await loadCredentials(page + 1);
  setCredentials(prev => [...prev, ...data.items]);
  setPage(prev => prev + 1);
  setHasMore(data.hasMore);
};
```

**Caching:**
```javascript
// Service Worker caching
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/v1/credentials')) {
    event.respondWith(
      caches.open('credentials-cache').then(cache => {
        return fetch(event.request).then(response => {
          cache.put(event.request, response.clone());
          return response;
        }).catch(() => {
          return cache.match(event.request);
        });
      })
    );
  }
});
```

### 3.4 Network Detection

**Connection-Aware Loading:**
```javascript
// Detect connection type
const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

function getConnectionSpeed() {
  if (!connection) return 'unknown';
  
  if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
    return 'slow';
  } else if (connection.effectiveType === '3g') {
    return 'medium';
  } else {
    return 'fast';
  }
}

// Adjust loading based on connection
const connectionSpeed = getConnectionSpeed();

if (connectionSpeed === 'slow') {
  // Load minimal content
  // Disable auto-play videos
  // Reduce image quality
  // Skip non-critical resources
} else if (connectionSpeed === 'medium') {
  // Load standard content
  // Lazy load images
} else {
  // Load full content
  // Preload critical resources
}
```

### 3.5 Progressive Web App (PWA)

**Service Worker:**
```javascript
// sw.js
const CACHE_NAME = 'dgihub-v1';
const urlsToCache = [
  '/',
  '/static/css/main.css',
  '/static/js/main.js',
  '/static/images/logo.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

**Manifest:**
```json
{
  "name": "DGIHub",
  "short_name": "DGIHub",
  "description": "Indonesia Vocational Training Platform",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#FFFFFF",
  "theme_color": "#2563EB",
  "icons": [
    {
      "src": "/static/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/static/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

## 4. Performance Targets

### 4.1 Core Web Vitals

- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### 4.2 Load Times

- **First Load**: < 3s on 3G
- **Subsequent Loads**: < 1s (cached)
- **Time to Interactive**: < 5s

### 4.3 Bundle Sizes

- **Initial Bundle**: < 200KB (gzipped)
- **Total JavaScript**: < 500KB (gzipped)
- **Total CSS**: < 50KB (gzipped)

## 5. Accessibility

### 5.1 Touch Accessibility

- Minimum touch target: 44x44px
- Adequate spacing between targets
- Clear visual feedback on touch
- Support for assistive technologies

### 5.2 Screen Reader Support

```html
<!-- Semantic HTML -->
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/" aria-current="page">Home</a></li>
    <li><a href="/credentials">Credentials</a></li>
  </ul>
</nav>

<!-- ARIA labels -->
<button aria-label="Add credential">
  <svg aria-hidden="true">...</svg>
</button>

<!-- Live regions -->
<div aria-live="polite" aria-atomic="true" id="notifications">
  <!-- Dynamic content -->
</div>
```

### 5.3 Keyboard Navigation

- All interactive elements keyboard accessible
- Focus indicators visible
- Logical tab order
- Skip links for main content

---

**Last Updated**: 2024-01-15  
**Version**: 1.0.0


