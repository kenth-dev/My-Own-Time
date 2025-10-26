A simple Clock & Pomodoro Timer

A digital clock and Pomodoro timer with a galaxy background. Optimized for low GPU usage.

Features

- 12-hour digital clock with flip animations
- Pomodoro timer with customizable work/break intervals
- Audio alarm (plays for 10 seconds)
- Galaxy starfield background
- Fully responsive design

Installation

1. Download the three files: `index.html`, `style.css`, `script.js`
2. Put them in the same folder
3. Open `index.html` in your browser

No installation or build process needed.

Usage

Clock Mode
- Opens automatically showing the current time
- Updates every second

Pomodoro Mode
1. Click the menu button (bottom-right corner)
2. Toggle "Pomodoro Mode"
3. Choose a preset or set custom work/break times
4. Click play to start

Keyboard Shortcuts
- `Space` - Start/Pause (Pomodoro mode only)
- `R` - Reset (Pomodoro mode only)

Customization

Change Colors
Edit in `style.css`:
```css
:root {
  --accent: #00bcd4;      /* Cyan color */
  --accent-2: #b319e2;    /* Purple color */
}
```

Change Timer Messages
Edit in `script.js`:
```javascript
pomoModeEl.textContent = mode === 'work' 
  ? 'FOCUS KA MUNA BABY!'    // Work message
  : 'Pahinga ka muna';        // Break message
```

Adjust Clock Size
Edit in `style.css`:
```css
.digits {
  font-size: clamp(120px, 18vw, 280px);  /* min, responsive, max */
}
```

Browser Support

Works on modern browsers: Chrome, Firefox, Safari, Edge (recent versions)

Performance

This version is optimized to use less GPU power:
- Static stars (no animation)
- Clock updates once per second
- Single canvas layer
- Reduced star count

Files

- `index.html` - Page structure
- `style.css` - Styling and layout
- `script.js` - Clock and timer logic

License

Free to use for personal and educational purposes.