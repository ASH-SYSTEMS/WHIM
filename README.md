# Roles Board (Past / Present / Future / TBD)

A lightweight, **fully client-side** web app to manage roles as a checklist and organize them into four categories: **Past**, **Present**, **Future**, and **TBD**. You can **drag and drop** roles between categories, **edit** names inline, **check** roles, and **export/import** your data — all without any server.

## Features
- ✅ **Checklist**: Each role has a checkbox to mark it.
- 🗂️ **Four categories**: Past, Present, Future, TBD.
- 🖱️ **Drag-and-drop** between categories (or change via dropdown).
- ✏️ **Inline editing** of role names.
- ➕ **Add roles** with a quick form.
- ♻️ **Delete roles** when no longer needed.
- 💾 **Auto-save** using LocalStorage.
- ⬇️⬆️ **Export/Import JSON** to back up or share.

## How to Run
1. Download and unzip the project.
2. Open `index.html` in any modern browser (Chrome, Edge, Firefox, Safari).
3. Start adding roles and move them across columns.

> No build steps, frameworks, or servers required.

## Data Format (Exported JSON)
An array of role objects:
```json
[
  { "id": "r_abc123", "name": "Team Lead", "category": "Present", "checked": false }
]
```

## Notes
- Data is stored only in your browser (LocalStorage). If you clear site data, roles will be removed unless you exported them.
- You can import JSON exported from this app (or crafted manually) as long as it follows the structure above. Unknown categories default to `TBD`.

## Accessibility & Keyboard
- Drag-and-drop is mouse/touch based; you can also change a card's category via the dropdown on the card.
- Press **Enter** while editing a title to finish editing.

## License
MIT
