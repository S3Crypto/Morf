# UI/UX Design Guide

This document outlines the user interface (UI) and user experience (UX) guidelines for the 3D Hoodie Designer application. It provides a consistent framework for designing and implementing the application's visual elements and interaction patterns.

## Design Principles

Our UI/UX design is guided by the following core principles:

### 1. Intuitive Interaction
- Controls should be self-explanatory and follow familiar patterns
- Learning curve should be minimized for new users
- Complex operations should be broken down into simpler steps

### 2. Responsive Feedback
- Every user action should provide immediate visual feedback
- System status should be clearly communicated at all times
- Errors should be explained in plain language with recovery options

### 3. Progressive Disclosure
- Present only the most important controls by default
- Reveal advanced features progressively as users need them
- Avoid overwhelming users with too many options at once

### 4. Accessibility First
- Design for inclusivity across different abilities
- Ensure keyboard navigability for all features
- Maintain sufficient color contrast and text size

### 5. Performance Perception
- Prioritize perceived performance through visual feedback
- Use loading strategies that keep the UI responsive
- Provide progress indicators for longer operations

## Color Palette

The application uses a carefully selected color palette designed for both aesthetic appeal and functional clarity.

### Primary Colors
- **Primary Blue** (#3B82F6): Main brand color, used for primary actions
- **Secondary Blue** (#1E40AF): Used for hover states and accents
- **Light Blue** (#DBEAFE): Used for backgrounds and selected states

### Neutral Colors
- **Dark Gray** (#1F2937): Primary text color
- **Medium Gray** (#6B7280): Secondary text and icons
- **Light Gray** (#F3F4F6): Backgrounds and dividers
- **White** (#FFFFFF): Main background and text on dark backgrounds

### Accent Colors
- **Success Green** (#10B981): Positive actions and success states
- **Warning Yellow** (#F59E0B): Attention-requiring elements
- **Error Red** (#EF4444): Error states and destructive actions
- **Highlight Purple** (#8B5CF6): Special features and highlights

### Usage Guidelines
- Use consistent colors for the same actions across the application
- Maintain WCAG 2.1 AA contrast ratio (4.5:1) for all text elements
- Limit the use of accent colors to maintain visual hierarchy

## Typography

### Fonts
- **Primary Font**: Inter, Sans-serif (for all UI elements)
- **Monospace Font**: JetBrains Mono (for code elements and technical information)

### Type Scale
- **Heading 1**: 30px / 1.2 line height / Bold
- **Heading 2**: 24px / 1.3 line height / Bold
- **Heading 3**: 20px / 1.4 line height / Bold
- **Heading 4**: 18px / 1.4 line height / Bold
- **Body**: 16px / 1.5 line height / Regular
- **Small**: 14px / 1.5 line height / Regular
- **Caption**: 12px / 1.5 line height / Regular

### Font Weight Usage
- **Bold (700)**: Headings, buttons, emphasis
- **Medium (500)**: Subheadings, labels, active states
- **Regular (400)**: Body text, descriptions
- **Light (300)**: Secondary information, captions

## Layout Structure

The application follows a modular layout structure with clear separation of concerns.

### Main Layout Components
- **Header**: Main navigation, mode switching, and global actions
- **Canvas Area**: Central 3D view occupying most of the screen
- **Control Panel**: Tools and options, can be toggled/collapsed
- **Footer**: Status information and secondary actions

### Responsive Behavior
- **Desktop**: Full layout with side panels
- **Tablet**: Collapsible panels, focused canvas view
- **Mobile**: Bottom sheet controls, maximized canvas

### Grid System
- 12-column grid for desktop layouts
- 8-column grid for tablet layouts
- 4-column grid for mobile layouts
- 16px base grid unit

### Spacing Scale
- **Extra Small**: 4px
- **Small**: 8px
- **Medium**: 16px
- **Large**: 24px
- **Extra Large**: 32px
- **2X Large**: 48px
- **3X Large**: 64px

## Component Library

### Core Components

#### Buttons
- **Primary Button**: High emphasis, used for main actions
  - Height: 40px
  - Padding: 16px horizontal
  - Background: Primary Blue
  - Text: White, 16px, Medium
  - Border Radius: 6px
  - States: Hover, Focus, Active, Disabled

- **Secondary Button**: Medium emphasis, used for secondary actions
  - Height: 40px
  - Padding: 16px horizontal
  - Background: White
  - Border: 1px solid Medium Gray
  - Text: Dark Gray, 16px, Medium
  - Border Radius: 6px
  - States: Hover, Focus, Active, Disabled

- **Tertiary Button**: Low emphasis, used for auxiliary actions
  - Height: 40px
  - Padding: 8px horizontal
  - Background: Transparent
  - Text: Primary Blue, 16px, Medium
  - Border Radius: 6px
  - States: Hover, Focus, Active, Disabled

- **Icon Button**: Used for common actions with universal icons
  - Size: 40px × 40px
  - Background: Transparent
  - Icon: Medium Gray (24px × 24px)
  - Border Radius: 6px
  - States: Hover, Focus, Active, Disabled

#### Form Controls

- **Text Input**:
  - Height: 40px
  - Padding: 12px horizontal, 8px vertical
  - Background: White
  - Border: 1px solid Light Gray
  - Text: Dark Gray, 16px, Regular
  - Border Radius: 6px
  - States: Hover, Focus, Error, Disabled

- **Slider**:
  - Track Height: 4px
  - Thumb Size: 16px × 16px
  - Track Color: Light Gray
  - Active Track: Primary Blue
  - Thumb Color: White with Primary Blue border
  - States: Hover, Focus, Disabled

- **Checkbox**:
  - Size: 18px × 18px
  - Border: 1.5px solid Medium Gray
  - Checked Background: Primary Blue
  - Check Mark: White
  - Border Radius: 4px
  - States: Hover, Focus, Checked, Disabled

- **Radio Button**:
  - Size: 18px × 18px
  - Border: 1.5px solid Medium Gray
  - Selected Dot: Primary Blue
  - Border Radius: 50%
  - States: Hover, Focus, Selected, Disabled

#### Specialized Controls

- **3D Transform Control**:
  - Axis Handles: X (Red), Y (Green), Z (Blue)
  - Scale: 1px = 1 unit in 3D space
  - Visibility: Adapt based on camera angle
  - Interaction: Direct manipulation or numeric input

- **Color Picker**:
  - Formats: Hex, RGB, HSL
  - Swatches: Quick access to palette colors
  - Opacity Support: Alpha channel slider
  - History: Recently used colors

- **Upload Area**:
  - Height: Auto (min 120px)
  - Border: 2px dashed Light Gray
  - Background: Light Blue (10% opacity)
  - Icon: Upload icon in Medium Gray
  - Text: "Drag & drop files or click to browse"
  - States: Hover, Drag Over, Error, Loading

### Containers

- **Card**:
  - Padding: Medium (16px)
  - Background: White
  - Border: 1px solid Light Gray
  - Border Radius: 8px
  - Shadow: 0 2px 4px rgba(0,0,0,0.05)

- **Panel**:
  - Width: 300px (desktop), flexible (responsive)
  - Background: White
  - Border: 1px solid Light Gray
  - Shadow: 0 4px 6px rgba(0,0,0,0.1)
  - States: Expanded, Collapsed

- **Modal**:
  - Width: 480px (desktop), 90% (mobile)
  - Padding: Large (24px)
  - Background: White
  - Border Radius: 12px
  - Shadow: 0 10px 25px rgba(0,0,0,0.2)
  - Overlay: Black at 50% opacity

- **Tooltip**:
  - Padding: 8px 12px
  - Background: Dark Gray
  - Text: White, Small (14px)
  - Border Radius: 4px
  - Max Width: 250px
  - Arrow: 8px pointing to reference element

### Feedback Indicators

- **Progress Bar**:
  - Height: 6px
  - Background: Light Gray
  - Fill: Primary Blue
  - Border Radius: 3px
  - Animation: Linear progress or indeterminate

- **Loading Spinner**:
  - Size: 24px (small), 40px (medium), 64px (large)
  - Color: Primary Blue
  - Animation: Rotating animation (750ms duration)

- **Notification**:
  - Types: Info, Success, Warning, Error
  - Width: 300px
  - Padding: Medium (16px)
  - Border-left: 4px solid type color
  - Background: White
  - Shadow: 0 4px 6px rgba(0,0,0,0.1)
  - Auto-dismiss: Optional with timer

## Interaction Patterns

### 3D Model Manipulation

#### Camera Controls
- **Orbit**: Left mouse drag or single-finger drag
- **Pan**: Right mouse drag or two-finger drag
- **Zoom**: Mouse wheel or pinch gesture
- **Reset**: Double-click or dedicated button

#### Model Controls
- **Rotate**: Manipulate axis handles or use rotation control widget
- **Scale**: Manipulate scale handles or use slider control
- **Move**: Drag model directly or use translation control widget
- **Transform Gizmo**: Context-aware tool that changes based on active mode

### AR Mode Interactions

#### Session Controls
- **Enter AR**: Prominent button with clear permission explanations
- **Exit AR**: Persistent button in corner of AR view
- **Guidance**: Progressive overlay explaining body positioning

#### AR Adjustments
- **Model Position**: Gesture-based drag to fine-tune placement
- **Model Scale**: Pinch gesture for resizing
- **Reset Position**: Dedicated button to re-align with detected body

### File Operations

#### Model Upload
- **Drag & Drop**: Primary method for file upload
- **Browse**: Secondary method via file picker
- **Recent Files**: Quick access to recently used models
- **Validation**: Immediate feedback on file compatibility

#### Export Actions
- **Screenshot**: Capture current view
- **Model Export**: Save current model with modifications
- **Share**: Generate shareable link or image

## Accessibility Guidelines

### Keyboard Navigation
- All interactive elements must be keyboard accessible
- Focus order should follow natural reading order
- Visible focus state for all interactive elements
- Keyboard shortcuts for common actions

### Screen Reader Support
- Semantic HTML structure
- ARIA roles and attributes where needed
- Alternative text for all visual elements
- Announcements for dynamic content changes

### Reduced Motion
- Respect `prefers-reduced-motion` setting
- Provide non-animated alternatives
- Avoid excessive motion effects

### Color and Contrast
- Maintain minimum 4.5:1 contrast ratio for text
- Do not rely on color alone to convey information
- Support high contrast mode

## UI State Handling

### Loading States
- Initial application loading: Full-screen loader with progress
- Model loading: Inline progress indicator in canvas area
- Operation processing: Context-specific indicators

### Empty States
- Empty canvas: Guidance on how to add first model
- No results: Friendly message with suggested actions
- No history: Information about how history is created

### Error States
- Validation errors: Inline feedback with clear resolution steps
- Operation failures: Non-disruptive notifications with retry options
- Fatal errors: Full-screen message with support information

### Success States
- Operation completion: Brief success message
- Upload complete: Automatic transition to model view
- Export complete: Confirmation with access to exported file

## Responsive Design Breakpoints

- **Mobile**: 0-767px
  - Stack layout with bottom sheet controls
  - Simplified camera controls
  - Touch-optimized interactions

- **Tablet**: 768-1023px
  - Sidebar collapses to icons
  - Controls expand on demand
  - Balanced touch/mouse interactions

- **Desktop**: 1024px+
  - Full expanded layout
  - Multiple panels visible simultaneously
  - Advanced control options available

## Animation and Motion

### Duration Guidelines
- **Extra Short**: 100ms (micro-interactions)
- **Short**: 200ms (simple transitions)
- **Medium**: 300ms (standard transitions)
- **Long**: 500ms (emphasis transitions)

### Easing Functions
- **Standard**: Cubic-bezier(0.4, 0.0, 0.2, 1) - Most UI elements
- **Deceleration**: Cubic-bezier(0.0, 0.0, 0.2, 1) - Elements entering screen
- **Acceleration**: Cubic-bezier(0.4, 0.0, 1, 1) - Elements leaving screen

### Animation Types
- **Fade**: Opacity transitions for appearing/disappearing
- **Slide**: Position transitions for panels and drawers
- **Scale**: Size transitions for emphasis
- **Transform**: 3D transitions for model interactions

## Voice and Tone

### Text Guidelines
- Use clear, concise language
- Avoid technical jargon unless necessary
- Keep instructions action-oriented
- Use sentence case for all text elements

### Error Messages
- Be specific about what went wrong
- Suggest a solution or next step
- Avoid blaming the user
- Keep technical details optional

### Guidance Text
- Provide progressive guidance at appropriate moments
- Use tooltips for explaining complex features
- Include first-time user onboarding for key features

## UI Implementation Guidelines

### Component Implementation
- Use TypeScript for type-safe component props
- Follow atomic design principles (atoms, molecules, organisms)
- Implement responsive behavior using CSS flexbox and grid
- Use CSS variables for theming and consistent values

### Performance Considerations
- Lazy load components not needed on initial render
- Use memo and useMemo for expensive renders
- Implement virtualization for long lists
- Optimize animations for 60fps performance

### Testing Requirements
- Component visual regression testing
- Accessibility testing with automated tools
- Cross-browser compatibility testing
- Performance benchmarking