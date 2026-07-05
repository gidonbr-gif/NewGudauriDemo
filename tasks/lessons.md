# Lessons

- Keep existing user changes intact, especially deleted or modified files unrelated to the active task.
- Edit tool + Hebrew dir path: backslash absolute paths sometimes autocorrect Hebrew chars to Arabic glyphs (ת→ت, ג→گ, ר→ر) → "File does not exist". Use forward-slash paths (`c:/Users/.../גודאורי אתר אינטרנט/file.html`); they've been reliable.
- i18n: `setLanguage` does `el.textContent = t[key]`. For an element with SVG icon + text (social pills), wrap ONLY the text in `<span data-i18n>` so the icon survives. Use `data-i18n-html` only when the value contains intended markup.

- PowerShell 5.1 file editing in this repo: a file WITHOUT a UTF-8 BOM gets decoded as ANSI by Get-Content, corrupting Hebrew on rewrite. Always use [System.IO.File]::ReadAllText + WriteAllText with UTF8Encoding($true), and verify with git diff --stat (a huge diff = encoding damage; revert immediately).
- PS 5.1 mangles embedded double quotes when passing multi-line args to native exes (git commit -m). Write the message to a file and use git commit -F.
