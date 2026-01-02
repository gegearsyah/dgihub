# UI Interaction Pattern Guide

## Overview

This document defines interaction patterns for the DGIHub platform, ensuring consistent user experience across all portals.

## 1. Navigation Patterns

### 1.1 Primary Navigation

**Mobile:**
- Bottom navigation bar (fixed)
- 4-5 main sections
- Icon + label
- Active state indicator

**Desktop:**
- Top navigation bar
- Horizontal menu
- Dropdown for sub-sections
- Breadcrumbs for deep navigation

### 1.2 Secondary Navigation

**Tabs:**
```html
<div class="tabs">
  <button class="tab active" aria-selected="true">All</button>
  <button class="tab" aria-selected="false">Active</button>
  <button class="tab" aria-selected="false">Completed</button>
</div>
```

**Sidebar (Desktop):**
- Collapsible sections
- Expandable sub-menus
- Active section highlighting

### 1.3 Search Pattern

**Search Bar:**
```html
<div class="search-bar">
  <input 
    type="search" 
    placeholder="Search credentials, skills..."
    aria-label="Search"
  />
  <button type="submit" aria-label="Search">
    <svg>...</svg>
  </button>
</div>
```

**Search Results:**
- Highlight matching terms
- Show result count
- Filter options
- Sort options

## 2. Form Patterns

### 2.1 Input Fields

**Standard Input:**
```html
<div class="form-group">
  <label for="name">Full Name</label>
  <input 
    type="text" 
    id="name" 
    name="name"
    required
    aria-required="true"
    aria-describedby="name-error"
  />
  <span class="error-message" id="name-error" role="alert"></span>
</div>
```

**States:**
- Default: Border color `--border`
- Focus: Border color `--accent`, shadow
- Error: Border color `--error`, error message
- Disabled: Reduced opacity, cursor not-allowed
- Success: Border color `--success`, checkmark icon

### 2.2 Select/Dropdown

**Single Select:**
```html
<div class="select-group">
  <label for="program">Training Program</label>
  <select id="program" name="program">
    <option value="">Select program...</option>
    <option value="1">Advanced Software Development</option>
    <option value="2">Cloud Architecture</option>
  </select>
</div>
```

**Multi-Select:**
- Checkbox list
- Tag-based selection
- Search within options

### 2.3 Date Picker

**Mobile:**
- Native date picker
- Calendar view
- Touch-friendly

**Desktop:**
- Calendar popup
- Keyboard navigation
- Range selection support

### 2.4 File Upload

**Drag & Drop:**
```html
<div class="upload-zone" 
     ondrop="handleDrop(event)" 
     ondragover="handleDragOver(event)">
  <svg>...</svg>
  <p>Drag and drop files here</p>
  <p>or</p>
  <button type="button">Browse Files</button>
  <input type="file" hidden />
</div>
```

**Progress Indicator:**
- Progress bar
- File name
- Cancel option
- Success/error state

## 3. Feedback Patterns

### 3.1 Loading States

**Skeleton Screens:**
```html
<div class="skeleton">
  <div class="skeleton-line" style="width: 60%"></div>
  <div class="skeleton-line" style="width: 80%"></div>
  <div class="skeleton-line" style="width: 40%"></div>
</div>
```

**Spinners:**
- Full page: Centered spinner with message
- Inline: Small spinner next to content
- Button: Spinner replaces text

### 3.2 Notifications

**Toast Notifications:**
```javascript
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toast.setAttribute('role', 'alert');
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('show');
  }, 100);
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
```

**Types:**
- Success: Green, checkmark icon
- Error: Red, X icon
- Warning: Yellow, warning icon
- Info: Blue, info icon

**Position:**
- Mobile: Bottom center
- Desktop: Top right

### 3.3 Confirmation Dialogs

**Pattern:**
```html
<div class="modal" role="dialog" aria-labelledby="modal-title">
  <div class="modal-content">
    <h2 id="modal-title">Confirm Action</h2>
    <p>Are you sure you want to delete this credential?</p>
    <div class="modal-actions">
      <button class="btn-secondary">Cancel</button>
      <button class="btn-danger">Delete</button>
    </div>
  </div>
</div>
```

**Use Cases:**
- Destructive actions
- Important decisions
- Data loss warnings

## 4. Data Display Patterns

### 4.1 Cards

**Standard Card:**
```html
<div class="card">
  <div class="card-header">
    <h3>Card Title</h3>
    <button class="card-action">...</button>
  </div>
  <div class="card-body">
    <p>Card content</p>
  </div>
  <div class="card-footer">
    <button>Action</button>
  </div>
</div>
```

**Variations:**
- Image card
- List card
- Stats card
- Interactive card (hover effects)

### 4.2 Tables

**Responsive Table:**
```html
<div class="table-container">
  <table class="table">
    <thead>
      <tr>
        <th>Name</th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>John Doe</td>
        <td><span class="badge badge-success">Active</span></td>
        <td>
          <button>View</button>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

**Mobile:**
- Stack rows vertically
- Hide less important columns
- Expandable rows for details

### 4.3 Lists

**Simple List:**
```html
<ul class="list">
  <li class="list-item">
    <div class="list-item-content">
      <h4>Item Title</h4>
      <p>Item description</p>
    </div>
    <button class="list-item-action">→</button>
  </li>
</ul>
```

**Variations:**
- Icon list
- Avatar list
- Action list

## 5. Action Patterns

### 5.1 Primary Actions

**Button Styles:**
- Primary: Solid background, white text
- Secondary: Outlined, colored text
- Tertiary: Text only, colored text
- Danger: Red background/text

**Button Sizes:**
- Large: 48px height (mobile primary actions)
- Medium: 40px height (standard)
- Small: 32px height (compact spaces)

### 5.2 Action Menus

**Dropdown Menu:**
```html
<div class="dropdown">
  <button class="dropdown-trigger">Actions</button>
  <ul class="dropdown-menu">
    <li><a href="#">Edit</a></li>
    <li><a href="#">Share</a></li>
    <li><a href="#" class="danger">Delete</a></li>
  </ul>
</div>
```

**Context Menu:**
- Long press on mobile
- Right-click on desktop
- Position near trigger

### 5.3 Swipe Actions

**Mobile Swipe:**
```javascript
let touchStartX = 0;
let touchEndX = 0;

element.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].screenX;
});

element.addEventListener('touchend', (e) => {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipe();
});

function handleSwipe() {
  if (touchEndX < touchStartX - 50) {
    // Swipe left - show actions
    showSwipeActions();
  } else if (touchEndX > touchStartX + 50) {
    // Swipe right - hide actions
    hideSwipeActions();
  }
}
```

## 6. Animation Patterns

### 6.1 Transitions

**Standard Duration:**
- Fast: 150ms (hover, focus)
- Medium: 250ms (modal, dropdown)
- Slow: 350ms (page transitions)

**Easing:**
- Ease-out for entrances
- Ease-in for exits
- Ease-in-out for state changes

### 6.2 Micro-interactions

**Button Press:**
```css
.button:active {
  transform: scale(0.95);
  transition: transform 0.1s;
}
```

**Card Hover:**
```css
.card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
```

**Loading Animation:**
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.loading {
  animation: pulse 1.5s ease-in-out infinite;
}
```

## 7. Error Handling Patterns

### 7.1 Form Errors

**Inline Errors:**
- Show below input field
- Red border on input
- Clear error message
- Icon indicator

**Validation:**
- Real-time validation (on blur)
- Submit validation (on submit)
- Clear errors on input change

### 7.2 Error Pages

**404 Not Found:**
- Friendly message
- Search option
- Navigation links
- Illustration

**500 Server Error:**
- Apology message
- Retry button
- Contact support link

### 7.3 Network Errors

**Offline Detection:**
```javascript
window.addEventListener('online', () => {
  showToast('Connection restored', 'success');
});

window.addEventListener('offline', () => {
  showToast('No internet connection', 'warning');
});
```

**Retry Pattern:**
- Show retry button
- Automatic retry with backoff
- Progress indicator

## 8. Accessibility Patterns

### 8.1 Focus Management

**Focus Trap (Modal):**
```javascript
function trapFocus(modal) {
  const focusableElements = modal.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  
  modal.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  });
}
```

### 8.2 ARIA Patterns

**Live Regions:**
```html
<div aria-live="polite" aria-atomic="true" class="sr-only">
  <!-- Dynamic announcements -->
</div>
```

**Modal:**
```html
<div 
  role="dialog" 
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
>
  <h2 id="modal-title">Modal Title</h2>
  <p id="modal-description">Modal description</p>
</div>
```

---

**Last Updated**: 2024-01-15  
**Version**: 1.0.0


