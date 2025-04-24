import { Resend } from 'resend';
import * as dotenv from 'dotenv';
import fetch, { Headers, Response, Request } from 'node-fetch';
import * as path from 'path';
import React from 'react';
import Newsletter from './templates/Newsletter';

if (!global.fetch) {
  global.fetch = fetch as unknown as typeof global.fetch;
  global.Headers = Headers as unknown as typeof global.Headers;
  global.Response = Response as unknown as typeof global.Response;
  global.Request = Request as unknown as typeof global.Request;
}

async function main() {
  dotenv.config({ path: path.resolve(process.cwd(), '.env.dev') });

  // Get API key from environment variables
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('Missing RESEND_API_KEY in environment variables');
    return;
  }
  const resend = new Resend(apiKey);
  try {
    // In your main file
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'laurenpothuru@gmail.com',
      subject: 'Hello World',
      react: React.createElement(Newsletter, {
        firstName: 'Lauren',
        headline: 'Latest Property Listings',
      }),
    });

    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent successfully! ID:', data ? data.id : ' no ID returned.');
    }
  } catch (err) {
    console.error('Exception when sending email:', err);
  }
}

main().catch(console.error);
