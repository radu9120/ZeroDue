# Email Invoice Setup Guide

## Overview

The application now supports sending invoices directly to clients via email using [Resend](https://resend.com).

## Setup Instructions

### 1. Get a Resend API Key

1. Go to [resend.com](https://resend.com) and sign up for an account
2. Navigate to the API Keys section
3. Create a new API key
4. Copy the API key

### 2. Configure Environment Variables

Add the following to your `.env.local` file:

```env
RESEND_API_KEY=re_your_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Or your production URL
```

### 3. Domain Verification (Production)

For production use:

1. Add and verify your domain in Resend dashboard
2. Update the `from` address in `/app/api/invoices/send/route.ts`:
   ```typescript
   from: `${business.name} <invoices@yourdomain.com>`;
   ```

For development, Resend provides a test domain that works with `<anything>@resend.dev`.

## Features

### Email Content

The email includes:

- Professional gradient header with company name
- Invoice details:
  - Invoice number
  - Issue date
  - Due date
  - Total amount with currency symbol
- Description (if provided)
- Direct link to view the invoice online
- Notes (if provided)
- Company contact information
- Responsive HTML design

### Usage

On the invoice success page:

1. Click the **"Send to Client"** button
2. The invoice will be emailed to the client's email address
3. You'll see a success/error toast notification

### API Endpoint

- **POST** `/api/invoices/send`
- **Body**:
  ```json
  {
    "invoiceId": "123",
    "businessId": "456"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Invoice sent to client@example.com",
    "emailId": "resend_email_id"
  }
  ```

### Error Handling

The system handles:

- Missing client email
- Invalid invoice or business ID
- Resend API errors
- Network failures

All errors show user-friendly toast notifications.

## Testing

### Development Testing

1. Use your own email address as the client email
2. Click "Send to Client"
3. Check your inbox for the invoice email

### Email Template

The email template is in `/app/api/invoices/send/route.ts`. You can customize:

- Colors and branding
- Layout and sections
- Content and wording

## Limitations

- **Free Resend Plan**: 100 emails/day, 3,000 emails/month
- Emails are sent from `invoices@resend.dev` in development
- Production requires domain verification

## Future Enhancements

Potential improvements:

- PDF attachment in email
- Email templates with React Email
- Send reminders for overdue invoices
- Track email open/click events
- Bulk send invoices
