## Dashboard Lite — תוכנית

יצירת גרסת "Lite" של הדשבורד בנתיב חדש, ללא שינוי בדשבורד הקיים. שימוש בקומפוננטות הקיימות בלבד (כפי שהוגדר במסך הרפרנס).

### מבנה העמוד (לפי הוויירפריים)

```text
┌─────────────┬─────────────┬─────────────┬───────────────────────┐
│ Air in      │ Ocean in    │ Road in     │                       │
│ Transit     │ Transit     │ Transit     │  Shipments by product │
│ (compact)   │ (compact)   │ (compact)   │  (donut minimal)      │
├─────────────┴─────────────┴─────────────┤                       │
│                                         │                       │
│   Last updated shipments (table)        │                       │
│                                         │                       │
└─────────────────────────────────────────┴───────────────────────┘
```

### נתיב חדש

- `/dashboard-lite` — נוסף ב-`src/App.tsx` ליד הנתיב הקיים `/dashboard`.
- הדשבורד הרגיל ב-`/dashboard` נשאר ללא שינוי.

### קובץ חדש: `src/pages/DashboardLite.tsx`

- מבוסס על מבנה `src/pages/Dashboard.tsx`: `Navbar` + כותרת "Dashboard Lite" + אותו toolbar (Search / Filter / widgets count / Manage / Download / Refresh).
- הגריד מורכב מקומפוננטות קיימות מ-`DashboardWidgets.tsx` בלבד — ללא קומפוננטות חדשות.

### שימוש בקומפוננטות קיימות

מ-`src/components/DashboardWidgets.tsx` ייוצאו 3 הקומפוננטות הקיימות (`ModeKPI`, `DocumentsByConsignee`, ו-helper לטבלה אחרונה אם נדרש) כדי שניתן יהיה להרכיב אותן בעמוד ה-Lite. אין שינוי לוגי בקומפוננטות עצמן — רק תוספת `export`.

מיפוי וויירפריים → קומפוננטה קיימת:
- "Air in Transit" → `<ModeKPI mode="Air" variant="compact" />`
- "Ocean in Transit" → `<ModeKPI mode="Ocean" variant="compact" />`
- "Road in Transit" → `<ModeKPI mode="Rail" variant="compact" />`
- "Shipments by product" (דונאט בלבד, ללא Legend) → `<DocumentsByConsignee variant="minimal" />`
- "Last updated shipments" → אותה הטבלה: `<ShipmentTable />` הקיימת (מציגה את אותם נתונים; הטבלה כבר תומכת ב-Column Manager כדי להציג רק File Number / Consignee / Total Weight / Last Status / Last update אם המשתמש ירצה לצמצם).

### Layout

- Grid 4 עמודות: שורה 1 — 3 KPI compact + דונאט minimal (תופס 1 עמודה, `row-span-2` כדי לעמוד לצד הטבלה).
- שורה 2 — `ShipmentTable` תופסת `col-span-3`.

### Navigation

- ללא הוספת פריט נוסף ב-Navbar בשלב הזה (לפי ההנחיה לשמור על המבנה הקיים). הגישה לעמוד דרך URL ישיר `/dashboard-lite`. אם תרצי קישור ב-Nav — אוסיף לאחר אישור.

### קבצים שיושפעו

1. `src/components/DashboardWidgets.tsx` — תוספת `export` ל-`ModeKPI` ו-`DocumentsByConsignee` (ללא שינוי התנהגותי).
2. `src/pages/DashboardLite.tsx` — חדש.
3. `src/App.tsx` — הוספת `<Route path="/dashboard-lite" element={<DashboardLite />} />`.
