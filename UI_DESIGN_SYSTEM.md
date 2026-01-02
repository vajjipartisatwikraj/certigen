# CertiGen UI Design System

> A modern, GenZ-aesthetic design system featuring vibrant gradients, glassmorphism effects, and playful micro-interactions.

---

## 🎨 Design Philosophy

CertiGen's UI is designed for tech-savvy users aged 18-35 who value both efficiency and aesthetics. The interface combines professional functionality with contemporary visual trends, creating an experience that feels intuitive, fun, and powerful.

### Key Principles
- **Vibrant & Energetic** - Bold gradients and bright accent colors
- **Modern & Clean** - Glassmorphism and soft shadows
- **Interactive & Fun** - Playful animations and hover effects
- **Efficient & Intuitive** - Clear information hierarchy
- **Responsive & Accessible** - Works beautifully on all devices

---

## 🌈 Color System

### Primary Colors

```css
--electric-blue: #00D4FF;   /* Primary actions, highlights */
--neon-purple: #A855F7;     /* Secondary elements, gradients */
--coral-pink: #FF6B9D;      /* Errors, warnings, delete actions */
--mint-green: #5EEAD4;      /* Success states, confirmations */
--cyber-yellow: #FCD34D;    /* Warnings, pending states */
```

### Dark Mode Palette

```css
--dark-bg: #0A0E27;         /* Main background with animated gradient */
--dark-surface: #1A1F3A;    /* Card and container backgrounds */
--dark-elevated: #252B48;   /* Elevated components, dropdowns */
--dark-border: rgba(255, 255, 255, 0.1);  /* Borders */
```

### Text Colors

```css
--text-primary: #E8EAED;    /* Primary text on dark backgrounds */
--text-secondary: #9CA3AF;  /* Secondary text, labels */
--text-light: #FFFFFF;      /* Text on colored backgrounds */
--text-dark: #1A1F3A;       /* Text on light backgrounds */
```

### Gradient Combinations

```css
/* Primary Gradient - Electric Blue to Neon Purple */
linear-gradient(135deg, #00D4FF 0%, #A855F7 100%)

/* Secondary Gradient - Coral Pink to Neon Purple */
linear-gradient(135deg, #FF6B9D 0%, #A855F7 100%)

/* Success Gradient - Mint Green to Electric Blue */
linear-gradient(135deg, #5EEAD4 0%, #00D4FF 100%)

/* Warm Gradient - Cyber Yellow to Coral Pink */
linear-gradient(135deg, #FCD34D 0%, #FF6B9D 100%)

/* Cool Gradient - Electric Blue to Mint Green */
linear-gradient(135deg, #00D4FF 0%, #5EEAD4 100%)
```

---

## 📝 Typography

### Font Families

- **Display**: Inter (900 weight) - Used for hero titles and large headings
- **Body**: Inter (400-600 weights) - Used for all body text and UI elements
- **Mono**: Fira Code - Used for code snippets and technical content

### Type Scale

```css
/* Hero Title */
font-size: clamp(48px, 8vw, 80px);
font-weight: 900;
letter-spacing: -2px;

/* Section Title */
font-size: 32px;
font-weight: 700;
letter-spacing: -1px;

/* Card Title */
font-size: 20px;
font-weight: 700;
letter-spacing: -0.5px;

/* Body Text */
font-size: 15px;
font-weight: 400;
line-height: 1.6;

/* Small Text */
font-size: 13px;
font-weight: 500;
```

### Text Gradient Effect

```css
.text-gradient {
  background: linear-gradient(135deg, #00D4FF 0%, #A855F7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

---

## 🔲 Components

### Buttons

#### Variants

**Primary Button** - Electric blue to purple gradient
```jsx
<Button variant="primary">Create Template</Button>
```

**Secondary Button** - Coral to purple gradient
```jsx
<Button variant="secondary">Bulk Generate</Button>
```

**Success Button** - Mint to blue gradient
```jsx
<Button variant="success">Save Changes</Button>
```

**Outline Button** - Transparent with border
```jsx
<Button variant="outline">Cancel</Button>
```

**Glass Button** - Glassmorphism effect
```jsx
<Button variant="glass">Browse</Button>
```

#### Sizes

```jsx
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>  {/* Default */}
<Button size="lg">Large</Button>
```

#### With Icons

```jsx
<Button icon={<PlusIcon />} iconPosition="left">
  Add Field
</Button>

<Button icon={<ArrowIcon />} iconPosition="right">
  Next
</Button>
```

#### Loading State

```jsx
<Button loading={true}>Processing...</Button>
```

### Inputs

#### Floating Label Input

```jsx
<Input
  label="Email Address"
  type="email"
  value={email}
  onChange={handleChange}
  placeholder="your@email.com"
/>
```

#### With Icons

```jsx
<Input
  label="Search"
  icon={<SearchIcon />}
  iconPosition="left"
  placeholder="Search templates..."
/>
```

#### Error State

```jsx
<Input
  label="Template Name"
  value={name}
  error="Name is required"
/>
```

### Cards

#### Glass Card

```jsx
<div className="glass-card">
  <h3>Card Title</h3>
  <p>Card content with glassmorphism effect</p>
</div>
```

#### Gradient Card

```jsx
<div className="card card-gradient">
  <h3>Highlighted Card</h3>
  <p>Card with gradient background</p>
</div>
```

#### Stat Card (Dashboard)

```html
<div className="stat-card glass-card">
  <div className="stat-icon" style="background: var(--gradient-primary)">
    📄
  </div>
  <div className="stat-details">
    <div className="stat-value">42</div>
    <div className="stat-label">Templates</div>
  </div>
</div>
```

### Modals

```jsx
<Modal
  isOpen={isOpen}
  onClose={handleClose}
  title="Edit Template"
  size="lg"  {/* sm, md, lg, xl */}
>
  <p>Modal content goes here</p>
</Modal>
```

### Progress Bar

```jsx
<ProgressBar
  total={100}
  current={45}
  successful={40}
  failed={2}
  status="processing"
  currentRecipient={{ name: "John Doe", email: "john@example.com" }}
/>
```

### Toast Notifications

```jsx
<Toast
  message="Certificate generated successfully!"
  type="success"  {/* success, error, warning, info */}
  duration={3000}
  onClose={handleClose}
/>
```

---

## 🎭 Visual Effects

### Glassmorphism

Creates a frosted glass effect with blur:

```css
.glass-card {
  background: rgba(26, 31, 58, 0.7);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 24px;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
}
```

### Shadows

```css
/* Small Shadow */
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

/* Medium Shadow */
box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);

/* Large Shadow */
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);

/* Glow Effect */
box-shadow: 0 0 24px rgba(168, 85, 247, 0.4);

/* Blue Glow */
box-shadow: 0 0 24px rgba(0, 212, 255, 0.4);
```

### Border Radius

```css
--radius-sm: 8px;    /* Small elements */
--radius-md: 16px;   /* Medium components */
--radius-lg: 24px;   /* Large cards */
--radius-xl: 32px;   /* Modals */
--radius-full: 9999px; /* Pills, badges */
```

---

## ✨ Animations

### Floating Animation

Gentle up-and-down motion:

```css
.floating {
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}
```

### Fade In

Entrance animation:

```css
.fade-in {
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Slide Up

Element slides up from bottom:

```css
.slide-up {
  animation: slideUp 0.5s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Pulse Glow

Pulsing glow effect:

```css
.pulse-glow {
  animation: pulseGlow 2s ease-in-out infinite;
}

@keyframes pulseGlow {
  0%, 100% { box-shadow: 0 0 20px rgba(0, 212, 255, 0.3); }
  50% { box-shadow: 0 0 40px rgba(0, 212, 255, 0.5); }
}
```

### Hover Effects

```css
/* Card Hover */
.card:hover {
  transform: translateY(-10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2), 0 0 24px rgba(168, 85, 247, 0.4);
}

/* Button Hover */
.btn:hover {
  transform: translateY(-2px);
  filter: brightness(1.1);
}

/* Image Scale on Hover */
.template-card:hover .template-preview img {
  transform: scale(1.05);
}
```

---

## 📱 Responsive Design

### Breakpoints

```css
/* Mobile */
@media (max-width: 480px) {
  /* Styles for phones */
}

/* Tablet */
@media (max-width: 768px) {
  /* Styles for tablets */
}

/* Desktop */
@media (min-width: 769px) {
  /* Styles for desktop */
}
```

### Mobile-First Approach

CertiGen uses a mobile-first approach where base styles are for mobile, and media queries enhance for larger screens.

### Touch-Friendly Targets

All interactive elements have minimum touch targets of 44x44px for optimal mobile usability.

---

## 🎯 Page Layouts

### Dashboard/Home

- **Hero Section** - Large gradient title with floating shapes
- **Stats Cards** - 4-column grid of glassmorphism stat cards
- **Template Gallery** - Responsive grid of template cards
- **Empty State** - Centered illustration with call-to-action

### Template Designer

- **Canvas Area** - Drag-and-drop interface with grid overlay
- **Toolbar** - Floating toolbar with text/image/QR options
- **Properties Panel** - Side panel for field customization
- **Preview Panel** - Real-time preview of certificate

### Bulk Generator

- **Drag-and-Drop Zone** - Large file upload area with visual feedback
- **CSV Preview Table** - Sortable table with field mapping
- **Progress Tracker** - Real-time progress with statistics
- **Results Summary** - Success/failure breakdown

### Certificate Gallery

- **Grid Layout** - Masonry-style grid of generated certificates
- **Search & Filter** - Top bar with search and filter options
- **Batch Selection** - Checkbox selection for bulk actions
- **Preview Modal** - Full-screen certificate preview

---

## 🎨 Background Effects

### Animated Gradient Background

```css
body {
  background: linear-gradient(-45deg, #0A0E27, #1A1F3A, #160F30, #1A1F3A);
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
```

### Floating Decorative Shapes

```html
<div className="floating-shapes">
  <div className="shape shape-1"></div>
  <div className="shape shape-2"></div>
  <div className="shape shape-3"></div>
</div>
```

---

## 🔧 Utility Classes

### Spacing

```css
.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 var(--space-lg);
}
```

### Text Utilities

```css
.text-gradient { /* Gradient text effect */ }
.text-center { text-align: center; }
.text-bold { font-weight: 700; }
```

### Display Utilities

```css
.flex { display: flex; }
.grid { display: grid; }
.hidden { display: none; }
```

---

## 🎨 Dark Mode Support

CertiGen is built with dark mode as the primary theme. All colors, shadows, and effects are optimized for dark backgrounds.

### Color Adaptation

- High contrast text colors (#E8EAED) for readability
- Translucent backgrounds with backdrop blur
- Vibrant accent colors that pop on dark surfaces
- Glow effects instead of traditional shadows

---

## 📊 Best Practices

1. **Consistent Spacing** - Use CSS variables for spacing (--space-sm, --space-md, etc.)
2. **Smooth Transitions** - All interactive elements have 300ms transitions
3. **Loading States** - Always show loading indicators for async operations
4. **Error Handling** - Display clear error messages with toast notifications
5. **Accessibility** - Maintain WCAG AA contrast ratios
6. **Performance** - Optimize animations with transform and opacity
7. **Progressive Enhancement** - Ensure core functionality works without JS

---

## 🚀 Implementation Guide

### Adding a New Page

1. Create component in `/pages` directory
2. Add fade-in class to main container
3. Use glassmorphism cards for content sections
4. Implement responsive breakpoints
5. Add to router in App.jsx

### Creating Custom Components

1. Extend existing design tokens
2. Use CSS variables for colors and spacing
3. Add hover and focus states
4. Implement loading and error states
5. Test on mobile devices

### Maintaining Consistency

- Always use design system variables
- Follow naming conventions
- Document new components
- Test across browsers
- Optimize for performance

---

**Version:** 1.0.0  
**Last Updated:** December 30, 2025  
**Design System:** CertiGen GenZ Aesthetic

---

Built with ❤️ for the next generation of certificate creators
