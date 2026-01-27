# API Reference Guide

## Base URL
```
Development: http://localhost:3000
Production: https://your-domain.com
```

---

## 1. Create Paste Endpoint

### Request
```
POST /api/paste
Content-Type: application/json
```

### Request Body
```json
{
  "content": "Your paste content here",
  "ttl": 3600,                    // Optional: Time-to-live in seconds
  "view_limit": 5                 // Optional: Maximum views allowed
}
```

### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| content | string | Yes | Paste content (non-empty) |
| ttl | number | No | Expiry time in seconds (null = never expires) |
| view_limit | number | No | View limit (null = unlimited views) |

### Response (Success - 201)
```json
{
  "id": "kxZJAxLc",
  "url": "http://localhost:3000/paste/kxZJAxLc"
}
```

### Response (Error - 400)
```json
{
  "error": "Bad request",
  "message": "Content is required and cannot be empty"
}
```

### Example
```bash
curl -X POST http://localhost:3000/api/paste \
  -H "Content-Type: application/json" \
  -d '{
    "content": "My secret code",
    "ttl": 3600,
    "view_limit": 3
  }'
```

---

## 2. Fetch Paste Endpoint

### Request
```
GET /api/paste/[id]
```

### Path Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Paste ID returned from create endpoint |

### Response (Success - 200)
```json
{
  "id": "kxZJAxLc",
  "content": "My secret code",
  "remaining_views": 2,
  "expires_at": "2026-01-27T17:28:00.123Z"
}
```

### Response (Error - 404)
```json
{
  "error": "Not found",
  "message": "The requested paste does not exist or has expired"
}
```

### Important Notes
- ⚠️ **Each fetch DECREMENTS the view count**
- ⚠️ **Returns 404 when views are exhausted**
- ⚠️ **Returns 404 when TTL expired**
- Uses `sessionStorage` in browser to prevent multiple decrements on reload

### Example
```bash
curl -X GET http://localhost:3000/api/paste/kxZJAxLc
```

---

## 3. Preview Paste Endpoint

### Request
```
GET /api/paste/preview/[id]
```

### Response (Success - 200)
```json
{
  "id": "kxZJAxLc",
  "content": "My secret code",
  "remaining_views": 3,
  "expires_at": "2026-01-27T17:28:00.123Z"
}
```

### Important Notes
- ✅ **Does NOT decrement view count**
- Use this for checking paste status without consuming views
- Returns same 404 for expired/unavailable pastes

### Example
```bash
curl -X GET http://localhost:3000/api/paste/preview/kxZJAxLc
```

---

## 4. Health Check Endpoint

### Request
```
GET /api/health
```

### Response (Success - 200)
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2026-01-27T12:30:45.123Z"
}
```

### Response (Error - 500)
```json
{
  "status": "unhealthy",
  "database": "disconnected",
  "error": "Error message details"
}
```

### Example
```bash
curl -X GET http://localhost:3000/api/health
```

---

## 5. Paste Viewer (HTML Page)

### Request
```
GET /paste/[id]
```

### Features
- Displays paste content safely (XSS-protected)
- Shows remaining views (if limited)
- Shows expiry time (if TTL set)
- Copy-to-clipboard button
- 404 page for unavailable pastes

### URL Example
```
http://localhost:3000/paste/kxZJAxLc
```

---

## Testing with Deterministic Time

For testing time-dependent features, use the `X-Test-Now` header:

### Example: Test Paste Expiration
```bash
# Create paste with 1 hour TTL
curl -X POST http://localhost:3000/api/paste \
  -H "X-Test-Now: 2026-01-27T10:00:00Z" \
  -H "Content-Type: application/json" \
  -d '{"content": "test", "ttl": 3600}'

# Fetch immediately (still valid)
curl -X GET http://localhost:3000/api/paste/[id] \
  -H "X-Test-Now: 2026-01-27T10:00:00Z"
# → 200 OK

# Fetch after TTL expires
curl -X GET http://localhost:3000/api/paste/[id] \
  -H "X-Test-Now: 2026-01-27T11:01:00Z"
# → 404 Not Found
```

---

## HTTP Status Codes

| Code | Meaning | Scenario |
|------|---------|----------|
| 200 | OK | Paste fetched successfully |
| 201 | Created | Paste created successfully |
| 400 | Bad Request | Invalid input (empty content) |
| 404 | Not Found | Paste expired, exhausted, or missing |
| 500 | Server Error | Database or server error |

---

## Error Handling

### Common Errors

#### 1. Empty Content
```json
{
  "error": "Bad request",
  "message": "Content is required and cannot be empty"
}
```
**Solution:** Provide non-empty content

#### 2. Paste Not Found
```json
{
  "error": "Not found",
  "message": "The requested paste does not exist or has expired"
}
```
**Causes:**
- Paste never existed
- TTL expired
- View limit exhausted
- Paste deleted

#### 3. Server Error
```json
{
  "error": "Internal server error",
  "message": "Failed to create paste"
}
```
**Solution:** Check server logs

---

## Frontend Integration

### JavaScript Example

```javascript
// Create a paste
async function createPaste(content, ttl = null, viewLimit = null) {
  const response = await fetch('/api/paste', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, ttl, view_limit: viewLimit })
  });
  
  if (!response.ok) {
    throw new Error('Failed to create paste');
  }
  
  return response.json();
}

// Fetch a paste (consumes a view)
async function fetchPaste(id) {
  const response = await fetch(`/api/paste/${id}`);
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Paste expired or view limit exceeded');
    }
    throw new Error('Failed to fetch paste');
  }
  
  return response.json();
}

// Preview without consuming a view
async function previewPaste(id) {
  const response = await fetch(`/api/paste/preview/${id}`);
  
  if (!response.ok) {
    throw new Error('Paste unavailable');
  }
  
  return response.json();
}

// Usage
(async () => {
  // Create paste
  const paste = await createPaste(
    'My secret message',
    3600,  // 1 hour TTL
    3      // 3 views allowed
  );
  console.log(`Share this link: ${paste.url}`);
  
  // Preview to check status
  const preview = await previewPaste(paste.id);
  console.log(`Remaining views: ${preview.remaining_views}`);
  
  // Fetch (consumes a view)
  const data = await fetchPaste(paste.id);
  console.log(`Content: ${data.content}`);
  console.log(`Remaining views: ${data.remaining_views}`);
})();
```

---

## Constraints & Limits

| Constraint | Value | Notes |
|-----------|-------|-------|
| Max content length | ~1MB | Depends on database config |
| Max paste lifetime | ∞ | No hard limit |
| Max views per paste | ∞ | No hard limit |
| Request timeout | 30s | Standard |
| Concurrent requests | ∞ | Limited by server |

---

## Best Practices

### 1. Always Provide TTL
```json
{
  "content": "Important data",
  "ttl": 86400  // 1 day - prevents permanent storage
}
```

### 2. Use View Limits for Sensitive Data
```json
{
  "content": "Password: xyz",
  "ttl": 3600,
  "view_limit": 1  // One-time view
}
```

### 3. Never Paste Sensitive Data Without Limits
```json
{
  "content": "DO NOT USE - API keys, passwords, tokens",
  "ttl": 300,      // 5 minutes
  "view_limit": 1  // Single view
}
```

### 4. Check Health Before Critical Operations
```bash
# Verify database is running
curl http://localhost:3000/api/health
```

### 5. Handle Session Storage in Browser
```javascript
// Browser automatically prevents multiple view decrements
// using sessionStorage - no manual handling needed
```

---

## Security Notes

### XSS Protection
- ✅ All content rendered safely
- ✅ No script execution possible
- ✅ Safe to share untrusted content

### Data Privacy
- ⚠️ Content transmitted over HTTP (use HTTPS in production)
- ⚠️ URLs are unguessable but not encrypted
- ⚠️ Use view limits for sensitive data

### Input Validation
- ✅ Content validated on server
- ✅ TTL and view_limit validated
- ✅ SQL injection prevented with parameterized queries

---

## Troubleshooting

### Paste Not Showing After Creation
**Problem:** Created paste but can't fetch it
**Solution:** 
- Check paste ID is correct
- Verify server is running (`curl /api/health`)
- Check browser console for errors

### Getting 404 Immediately
**Problem:** Created paste, but first fetch returns 404
**Possible Causes:**
- TTL already expired (check system time)
- Using test time header incorrectly
- Paste ID typo

**Solution:**
- Create without TTL: `{ "content": "test" }`
- Check server logs for details

### View Count Not Updating
**Problem:** Remaining views stay the same after fetch
**Solution:**
- This was a known bug that has been fixed
- Ensure you're using the latest code
- Clear browser cache: `Ctrl+Shift+Delete`

### Server Error 500
**Problem:** Getting 500 errors on all requests
**Solution:**
- Verify database is running
- Check environment variables
- Review server logs
- Run health check: `curl /api/health`

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-27 | Initial release with all features |

---

## Support

For issues or questions:
1. Check server logs: `npm run dev` output
2. Review test cases in TEST_REPORT.md
3. Check IMPLEMENTATION_VERIFICATION.md for detailed specs
