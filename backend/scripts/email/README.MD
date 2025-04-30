# CUApts Email System

Welcome to the CUApts email-sending system. This folder is the home for all logic and templates
related to the emails that we send to users, such as newsletters, information about events,
reminders, etc.

## Infrastructure

This system is built on top of [Resend](https://resend.com)'s email API.

## Getting Started

1. Install dependencies in the root directory:

   ```bash
   npm install resend dotenv node-fetch
   ```

2. Set up environment variables in `.env.dev` **in the root directory of the project (`cu-apts`)**:

   ```
   RESEND_API_KEY=your_resend_api_key  # contact TPM for access
   GLOBAL_FROM_NAME= CUApts  # what the name of the sender will be
   GLOBAL_FROM_EMAIL= cuapts.org  # what the email of the sender will be
   ```

   **Never commit this file!** (Should already be in `.gitignore`.)

3. Create a new template in `scripts/email/templates/` or modify the existing
   `GenerateNewsletter.tsx` template. Make sure to test out the formatting in multiple email
   services (ex: gmail vs apple mail). Each service will result in slightly different outputs, so
   ensure that your template is consistent throughout.

4. Update the `emailService.ts` file to use your template and customize the campaign options.

5. From the root directory, run the script:
   ```bash
   ts-node backend/scripts/email/emailService.ts
   ```

**Important**: Before running in production, make sure to test with a small batch of recipients.

## How It Works

1. The `emailService.ts` script:

   - Loads environment variables from `.env.dev`
   - Initializes the Resend client with your API key
   - Fetches user data from Firebase
   - Fetches apartment property data from your API if needed
   - Processes users into batches of 50 recipients
   - Sends emails to each batch with your template

2. The system chunks the user list into batches of 50 recipients to optimize sending (Resend allows
   up to 50 email addresses in a single API call).

3. Emails are sent to all batches concurrently, with progress updates printed to the console.

## Creating Templates

Templates in this system are React components that return JSX to be rendered as HTML emails.

1. Create a new TSX file in `scripts/email/templates/`.
2. Define your template structure using React components:

   ```tsx
   import React from 'react';

   interface TemplateProps {
     // Define any props your template needs
     customData?: string;
   }

   const YourTemplate: React.FC<TemplateProps> = ({ customData }) => {
     return (
       <BaseLayout>
         {/* Your email content here */}
         <h1>Hello from CUApts!</h1>
         <p>{customData || 'Your default content'}</p>
       </BaseLayout>
     );
   };

   export default YourTemplate;
   ```

3. To use your template, update the `emailService.ts` file:

   ```typescript
   import YourTemplate from './templates/YourTemplate';

   // In the sendEmailCampaign function:
   const { data, error } = await resend.emails.send({
     from: `${fromName} <${fromEmail}>`,
     to: toEmail,
     bcc: bccEmails,
     subject: subject,
     react: React.createElement(YourTemplate, { customData: 'Your custom content' }),
   });
   ```

## Creating and Sending Newsletters

The `GenerateNewsletter` template provides an easy way to send newsletters featuring apartment
listings.

### How to Configure a Newsletter Campaign:

1. In the `emailService.ts` file, update the `sendEmailCampaign` options:

   ```typescript
   await sendEmailCampaign({
     subject: 'Your Newsletter Subject',
     toEmail: 'primary-recipient@example.com', // This is the main recipient
     recentLandlordPropertyIDs, // Featured landlord properties
     lovedPropertyIds, // Most loved properties
     recentAreaPropertyIDs, // Featured area properties
   });
   ```

2. In `templates/GenerateNewsletter.tsx`, add newsletter information.

3. For further customization:
   - Extend the `GenerateNewsletter` component to accept additional props
   - Modify the component structure in `Newsletter.tsx`

### User Batching

The `getUserBatches` function splits your user list into batches of 50 recipients:

```typescript
// This is handled in emailService.ts
const userBatches = await getUserBatches(50);
console.log(`Preparing to send emails to ${userBatches.length} batches of users (${50} per batch)`);
```

## Fetching User Data

User data is fetched from Firebase using the `firebase_users_loader.ts` helper module:

```typescript
import { getUserBatches, USERS } from './helpers/firebase_users_loader';

// This gives you access to all users and the ability to filter them
const validEmails = USERS.filter((user) => user.email && user.email.includes('@'));
```

## Fetching Apartment Data

Apartment data is fetched from your API using the `getPropertiesByIds` function:

```typescript
const getPropertiesByIds = async (ids: string[]): Promise<ApartmentWithId[]> => {
  try {
    const idParam = ids.join(',');
    const response = await fetch(`${API_BASE_URL}/api/apts/${idParam}`);
    // ...process and return data
  } catch (error) {
    console.error('Error fetching properties:', error);
    return [];
  }
};
```

Note that this must be done **before** running the GenerateNewsletter script, as all reactive code
is converted to pure HTML/CSS when being sent out. Thus, no data can be fetched in the body of an
email. To work around this, you must fetch property data before sending the email, and pass this
data to the newsletter template.

## Further Notes

- You **must** run the script from the root directory of the project.
- The system automatically handles large mailing lists by splitting them into batches of 50
  recipients.
- Always test your emails with a small group before sending to all users.
- The system includes error handling and logging for each batch of emails sent.
- Keep your templates responsive for both desktop and mobile viewing.
