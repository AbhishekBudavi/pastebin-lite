
# Setup & Running Instructions

This guide is for recruiters, interviewers, and anyone reviewing this code.

## 📋 What You're Looking At

A production-grade **Pastebin-Lite API** that demonstrates:
- ✅ Solid backend fundamentals (Express, PostgreSQL)
- ✅ Careful handling of concurrency (atomic transactions)
- ✅ Clean API design with error handling
- ✅ Comprehensive test coverage
- ✅ Real-world thinking (TTL, view limits, race conditions)

## 🚀 Run It in 5 Minutes

### Step 1: Install PostgreSQL

**macOS (Homebrew):**
```bash
brew install postgresql
brew services start postgresql
```

**Windows (Installer):**
Download from https://www.postgresql.org/download/windows/

**Linux (apt):**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo service postgresql start
```

### Step 2: Create Database

```bash
psql -U postgres

# In psql shell:
CREATE DATABASE pastebin_lite;
\q
```

### Step 3: Start Backend

```bash
cd backend
npm install
npm run dev
```

You should see:
```
✓ Database connected
✓ Schema initialized
✓ Server running on http://localhost:3001
```

### Step 4: Test It

```bash
# In another terminal
curl -X POST http://localhost:3001/api/paste \
  -H "Content-Type: application/json" \
  -d '{"content": "Hello World"}'

# Response:
# {
#   "id": "xyz123abc45",
#   "url": "http://localhost:3000/paste/xyz123abc45"
# }

# Fetch it back:
curl http://localhost:3001/api/paste/xyz123abc45

# Check health:
curl http://localhost:3001/api/health
```

### Step 5: Run Tests (Optional)

```bash
npm test
```

Expect output like:
```
PASS  tests/api.test.js
  ✓ should create a paste with content
  ✓ should decrement views on each fetch
  ✓ should return 404 after expiry
  ✓ should handle concurrent view decrements safely
  ...
```

---

## 🎨 Optional: Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Visit http://localhost:3000 in your browser.

---

## 🔍 Key Code to Review

### Backend

**[API Routes](backend/src/routes/api.js)** (100 lines)
- Clean endpoint implementations
- Input validation
- Error handling

**[Database Operations](backend/src/db/operations.js)** (80 lines)
- Atomic view decrement (race condition safe)
- TTL enforcement
- Transaction handling

**[Test Suite](backend/tests/api.test.js)** (250 lines)
- Comprehensive coverage
- Edge cases (large files, special chars)
- Concurrency testing

**[Middleware](backend/src/middleware/handlers.js)** (30 lines)
- Error standardization
- Test time support

### Frontend

**[Home Page](frontend/app/page.tsx)** (150 lines)
- Form with optional TTL/view limit
- API integration
- Loading/error states

**[Paste Viewer](frontend/app/paste/%5Bid%5D/page.tsx)** (100 lines)
- Safe content rendering
- View tracking display
- Copy to clipboard

---

## ❓ FAQ

**Q: Do I need Docker?**
A: No, but you need PostgreSQL running locally. See Step 1.

**Q: Why PostgreSQL and not MongoDB?**
A: TTL and atomic operations are critical. PostgreSQL's ACID guarantees and transaction support make it safer than document databases for this use case.

**Q: Can I test without running the database?**
A: No, tests require a real PostgreSQL instance. But setup takes <5 minutes.

**Q: What's with the `x-test-now` header?**
A: It lets tests control time for TTL testing. See tests/api.test.js line 120.

**Q: Are pastes really deleted?**
A: Expired pastes return 404. The database can optionally run a cleanup job: `DELETE FROM pastes WHERE expires_at < NOW()`.

**Q: Can this go to production?**
A: Yes. Add HTTPS, authentication (if needed), monitoring, and backups. See README.md for details.

---

## 📞 Questions?

Check the main [README.md](README.md) for architecture details and design decisions.

Happy reviewing! 🚀
