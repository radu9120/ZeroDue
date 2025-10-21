# Email Tracking Implementation

## What's Implemented

### 1. Database Fields (Added to Invoices table)

Run `/scripts/add_email_tracking_fields.sql` in Supabase to add:

- `email_id` - Resend email ID
- `email_sent_at` - Send timestamp
- `email_delivered` / `email_delivered_at`
- `email_opened` / `email_opened_at` / `email_open_count`
- `email_clicked` / `email_clicked_at` / `email_click_count`
- `email_bounced` / `email_bounced_at`
- `email_complained` / `email_complained_at`

### 2. Webhook Endpoint

`/api/webhooks/resend` - Receives events from Resend:

- `email.delivered` - Email successfully delivered
- `email.opened` - Client opened the email
- `email.clicked` - Client clicked a link
- `email.bounced` - Email bounced
- `email.complained` - Marked as spam

### 3. Activity Tracking

New activity types logged:

- "Invoice email delivered"
- "Invoice email opened"
- "Invoice email clicked"
- "Invoice email bounced"
- "Invoice email marked as spam"

### 4. Updated Send Flow

When sending an invoice:

1. Email sent via Resend
2. `email_id` and `email_sent_at` stored
3. Status updated to "sent"
4. Activity logged with email_id

## Setup Steps

### 1. Run Database Migration

```sql
-- In Supabase SQL Editor, run:
/scripts/add_email_tracking_fields.sql
```

### 2. Configure Resend Webhooks

1. Go to Resend dashboard → Webhooks
2. Add webhook URL: `https://yourdomain.com/api/webhooks/resend`
3. Select events:
   - email.delivered
   - email.opened
   - email.clicked
   - email.bounced
   - email.complained
4. Copy signing secret to `.env`:
   ```
   RESEND_WEBHOOK_SECRET=your_secret_here
   ```

### 3. Deploy

The webhook endpoint is already added to middleware as a public route.

## How It Works

1. **User sends invoice** → Email ID stored in database
2. **Resend delivers email** → Webhook triggered, `email_delivered` = true
3. **Client opens email** → Webhook triggered, `email_opened` = true, count incremented
4. **Client clicks link** → Webhook triggered, `email_clicked` = true, count incremented
5. **Activity logged** for each event in Recent Activity

## Benefits

- ✅ Track which invoices were actually delivered
- ✅ See when clients open your invoices
- ✅ Know when clients click to view invoices
- ✅ Identify bounced emails
- ✅ All events logged in activity feed
- ✅ Historical tracking with timestamps and counts

## Next Steps

You can display this tracking data:

- Add badges to invoice list (📧 Delivered, 👁 Opened, 🖱 Clicked)
- Show engagement metrics in business dashboard
- Send automatic reminders for unopened invoices
- Analytics on email performance
