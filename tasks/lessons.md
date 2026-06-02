# Lessons

- Keep existing user changes intact, especially deleted or modified files unrelated to the active task.
- Edit tool + Hebrew dir path: backslash absolute paths sometimes autocorrect Hebrew chars to Arabic glyphs (ת→ت, ג→گ, ר→ر) → "File does not exist". Use forward-slash paths (`c:/Users/.../גודאורי אתר אינטרנט/file.html`); they've been reliable.
- i18n: `setLanguage` does `el.textContent = t[key]`. For an element with SVG icon + text (social pills), wrap ONLY the text in `<span data-i18n>` so the icon survives. Use `data-i18n-html` only when the value contains intended markup.
