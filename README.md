# CampusShare 🎓

> **A peer-to-peer campus marketplace for students to buy, sell, lend, donate, and exchange textbooks, electronics, notes, and hostel essentials.**

---

## 📖 Overview

**CampusShare** connects verified university students to create a safe, sustainable, and cost-effective internal campus economy. Students can list unused items, find semester textbooks, borrow equipment, donate study materials, and message campus peers directly.

All item valuations and transactions are formatted in **Indian Rupees (₹ INR)**.

---

## ✨ Features

- **Multi-Type Marketplace**:
  - **Sell**: Sell pre-owned books, gadgets, stationery, lab tools, and hostel gear.
  - **Lend / Borrow**: Short-term equipment borrowing between students.
  - **Donate**: Free textbook and study material giveaways to junior students.
  - **Exchange**: Direct item-for-item swaps.

- **Smart Search & Filter**:
  - Real-time search by title, course code, or author.
  - Category filters: *Books, Notes, Electronics, Stationery, Lab Equipment, Project Kits, Hostel Items, Bags, Sports, Other*.
  - Filter by listing type, condition, and price range.

- **Post an Item Wizard**:
  - 5-step guided listing creator:
    1. Basic Information (title, category, condition)
    2. Listing Type & Pricing (sell, lend, donate, exchange)
    3. Item Details & Campus Pickup Location
    4. Photo Uploads / SVG presets
    5. Final Review & Instant Publish

- **Authentication & Security**:
  - Powered by **Supabase Auth**.
  - Email & Password registration with optional university email verification.
  - One-click **Continue with Google** OAuth login.
  - Route guards on private views (`profile`, `my-listings`, `post-item`, `settings`, `messages`, `wishlist`).

- **User Accounts & Social Features**:
  - **Saved Wishlist**: Bookmark items for quick access.
  - **Peer Messaging**: Direct campus student conversations.
  - **Profile & Settings**: Manage student bio, campus credentials, and preferences.

---

## 🛠️ Tech Stack

- **Frontend**: Vanilla HTML5, CSS3, modern JavaScript (ES6+ Modules) — *Zero build step or heavy dependencies required*.
- **Styling**: Custom modular CSS architecture (`style.css`, `components.css`, `marketplace.css`, `responsive.css`).
- **Auth & Backend**: [Supabase](https://supabase.com/) (`@supabase/supabase-js` via CDN import map).
- **Storage**: Client-side state persistence with `localStorage` and Supabase session management.

---

## 📁 Project Structure

```text
CampusShare/
├── README.md                 # Project documentation
├── frontend/
│   ├── index.html            # Main landing page
│   ├── html/                 # Feature pages
│   │   ├── explore.html      # Marketplace browsing & filtering
│   │   ├── item-details.html # Item information & seller contact
│   │   ├── login.html        # Student login & Google OAuth
│   │   ├── register.html     # Account creation & email verification
│   │   ├── post-item.html    # Multi-step item submission wizard
│   │   ├── my-listings.html  # Manage active/sold user listings
│   │   ├── wishlist.html     # Saved favorite items
│   │   ├── messages.html     # Direct peer messaging chat UI
│   │   ├── profile.html      # Public/private student profile
│   │   └── settings.html     # Profile & account configuration
│   ├── css/                  # Modular stylesheets
│   │   ├── style.css         # Theme tokens, typography & base resets
│   │   ├── components.css    # Buttons, inputs, modals, cards, badges
│   │   ├── homepage.css      # Hero, categories, and feature section styles
│   │   ├── marketplace.css   # Listing cards, auth pages, post form wizard
│   │   └── responsive.css    # Mobile nav drawer & responsive breakpoints
│   ├── js/                   # Client application logic
│   │   ├── main.js           # Dynamic navigation, global header/footer, routing
│   │   ├── storage.js        # State manager & LocalStorage persistence
│   │   ├── data.js           # Categories, conditions, and schema constants
│   │   ├── marketplace.js    # Explore page filtering & search logic
│   │   ├── post-item.js      # Multi-step wizard validation & publish handler
│   │   ├── item-details.js   # Single item rendering & contact actions
│   │   ├── wishlist.js       # Saved items manager
│   │   ├── messages.js       # Conversations & chat handler
│   │   └── profile.js        # Profile & account settings handler
│   ├── src/
│   │   └── supabaseClient.js # Supabase client initialization
│   └── assets/               # Static images and icons
```

---

## 🚀 Getting Started

### 1. Prerequisites
You only need a modern web browser and a static local server (e.g. Python, Node.js, or VS Code Live Server).

### 2. Clone the Repository
```bash
git clone https://github.com/Jayant052005/CampusShare.git
cd CampusShare
```

### 3. Run Locally

Navigate into the `frontend` folder and start a static server:

**Using Python 3:**
```bash
cd frontend
python -m http.server 3000
```

**Using Node (`npx serve`):**
```bash
npx serve frontend -p 3000
```

**Using VS Code Live Server:**
Right-click `frontend/index.html` and select **"Open with Live Server"**.

Visit **`http://localhost:3000`** in your browser.

---

## 🔐 Supabase Configuration

The application is wired to Supabase for authentication and database management:

1. Locate `frontend/src/supabaseClient.js`:
   ```javascript
   import { createClient } from "@supabase/supabase-js";

   const SUPABASE_URL = "https://ymxdypzryicdpkdgcprg.supabase.co";
   const SUPABASE_PUBLIC_KEY = "sb_publishable_QRbRXa97SlOzUaBjlDv-dA_URF7QUPt";

   export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);
   ```

2. **Google OAuth Setup**:
   - In **Google Cloud Console**, configure an OAuth 2.0 Web Client.
   - Add the Authorized Redirect URI:
     ```
     https://<YOUR-PROJECT-ID>.supabase.co/auth/v1/callback
     ```
   - In **Supabase Dashboard** → **Authentication** → **Providers** → Enable **Google** and paste your Client ID & Secret.
   - In **Supabase Dashboard** → **URL Configuration**, set the Site URL to `http://localhost:3000` (or your production domain).

---

## 🌐 Deployment

CampusShare is a pure static frontend and can be hosted for free on:

- **Vercel**: Import repository, set Root Directory to `frontend`, leave build commands blank.
- **Netlify**: Drag-and-drop the `frontend` folder or connect via GitHub with Publish Directory set to `frontend`.
- **GitHub Pages**: Configure GitHub Pages in repository settings to serve the project.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

