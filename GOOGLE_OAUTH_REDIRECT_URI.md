# Google OAuth Redirect URI - Correct Paths

## ✅ CORRECT Redirect URI

The correct redirect URI path is:
```
/api/auth/google/callback
```

**NOT** `/api/auth/callback/google` ❌

## Where to Use This Path

### 1. Google Cloud Console
When adding the Authorized Redirect URI in Google Cloud Console, use:

**Development:**
```
http://localhost:3000/api/auth/google/callback
```

**Production:**
```
https://ciarajevans.com/api/auth/google/callback
```

### 2. Environment Variables
The code automatically constructs the full URL from `NEXTAUTH_URL`:
```env
NEXTAUTH_URL=http://localhost:3000
```

The code will use: `http://localhost:3000/api/auth/google/callback`

### 3. File Structure
The Next.js App Router file structure matches the URL path:
```
app/
  api/
    auth/
      google/
        route.ts              → /api/auth/google
        callback/
          route.ts           → /api/auth/google/callback
```

## Verification

All code files use the correct path:
- ✅ `lib/google-calendar.ts` - Uses `/api/auth/google/callback`
- ✅ `app/api/auth/google/route.ts` - Uses `/api/auth/google/callback`
- ✅ `app/api/auth/google/callback/route.ts` - Uses `/api/auth/google/callback`

## Common Mistakes

❌ **Wrong:** `/api/auth/callback/google`
❌ **Wrong:** `/api/callback/google`
❌ **Wrong:** `/callback/google`

✅ **Correct:** `/api/auth/google/callback`

## Testing

1. Visit: `http://localhost:3000/api/auth/google`
2. You'll be redirected to Google for authorization
3. After authorization, Google will redirect to: `http://localhost:3000/api/auth/google/callback`
4. The callback route will display your refresh token

