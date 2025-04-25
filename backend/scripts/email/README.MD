# CUApts Email System

This is the CUApts email-sending system. This folder is the home for all logic and templates related
to the emails that we send to users, such as newsletters, information about events, reminders, etc.

## Infrastructure

This system is built on top of [Resend](https://resend.com)'s email API.

## Getting Started

1. Install dependencies:

```
npm install resend
```

2. Set up environment variables in `.env.dev` **in the root directory of the project (`cu-apts`)**:

```
RESEND_API_KEY= some_api #contact TPM for access
GLOBAL_FROM_NAME=CUApts #what the name of the sender will be
GLOBAL_FROM_EMAIL=cuaptsdti@gmail.com #what the email of the sender will be (once DNS records for cuaptsdti.org are configured)
```

**Never commit this file!** (Should already be in `.gitignore`.)

3.

4.  From the root directory, run

```
ts-node backend/scripts/email/emailService.ts
```

### How it Works

### Creating Templates

1. Create a new tsx file in `scripts/email/templates/`
2.
