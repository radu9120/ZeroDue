# Debug Theme Switching

## Steps to Debug:

1. **Open the site**: http://localhost:3001

2. **Open Browser Console**:

   - Chrome/Edge: F12 or Cmd+Option+J (Mac) / Ctrl+Shift+J (Windows)
   - Firefox: F12 or Cmd+Option+K (Mac) / Ctrl+Shift+K (Windows)
   - Safari: Cmd+Option+C (Mac) - need to enable Developer menu first

3. **Click the theme toggle button** (Sun/Moon icon in navbar)

4. **Check Console Logs** - You should see:

   ```
   Current theme: light (or dark/system)
   Setting new theme: dark (or system/light)
   Theme after set: dark
   ThemeProvider: setTheme called with: dark
   ThemeProvider: Current theme: light
   ThemeProvider: localStorage set and state updated
   ThemeProvider: useEffect triggered with theme: dark
   ThemeProvider: Using explicit theme: dark
   ThemeProvider: Adding 'dark' class to root
   ThemeProvider: Root classes now: dark
   ```

5. **Check if theme is changing**:

   - Open Elements/Inspector tab
   - Look at the `<html>` tag
   - It should have `class="dark"` when in dark mode
   - It should have NO class (or not "dark") when in light mode

6. **Check localStorage**:
   - In Console, run: `localStorage.getItem('invoiceflow-theme')`
   - Should return: "light", "dark", or "system"

## Common Issues:

### If you see NO console logs:

- The button click handler isn't working
- Check if JavaScript is enabled
- Check if there are any errors in console

### If logs appear but theme doesn't change:

- Check the `<html>` element for the "dark" class
- The CSS might not be applying properly
- Try: `document.documentElement.classList` in console

### If "dark" class is added but styles don't change:

- CSS issue with dark mode selectors
- Check globals.css is loaded
- Try: `document.querySelector('html').className` in console

## Manual Test in Console:

Try these commands one by one:

```javascript
// Check current theme
localStorage.getItem("invoiceflow-theme");

// Manually set to dark
localStorage.setItem("invoiceflow-theme", "dark");
document.documentElement.classList.add("dark");

// Manually set to light
localStorage.setItem("invoiceflow-theme", "light");
document.documentElement.classList.remove("dark");

// Check HTML element classes
document.documentElement.className;

// Force reload
location.reload();
```

## What to Report:

Please tell me:

1. What console logs appear when you click the button?
2. Does the `<html class="...">` change when you click?
3. What does `localStorage.getItem('invoiceflow-theme')` show?
4. Are there any error messages in the console?
