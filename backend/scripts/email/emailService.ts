import { Resend } from 'resend';
import * as dotenv from 'dotenv';
import fetch, { Headers, Response, Request } from 'node-fetch';
import * as path from 'path';
import React from 'react';
import { ApartmentWithId } from '@common/types/db-types';
import GenerateNewsletter from './templates/GenerateNewsletter';
import { getUserBatches, USERS } from './helpers/firebase_users_loader';

// Initialize fetch globals if needed
if (!global.fetch) {
  global.fetch = fetch as unknown as typeof global.fetch;
  global.Headers = Headers as unknown as typeof global.Headers;
  global.Response = Response as unknown as typeof global.Response;
  global.Request = Request as unknown as typeof global.Request;
}

type EmailCampaignOptions = {
  subject?: string;
  toEmail?: string;
  recentLandlordPropertyIDs?: string[];
  lovedPropertyIds?: string[];
  recentAreaPropertyIDs?: string[];
};

/**
 * sendEmailCampaign
 * Sends a marketing email campaign to batches of users featuring apartment properties.
 *
 * @param options - Configuration options for the email campaign
 * @param options.subject - Email subject line (default: 'Check Out These New Apartments!')
 * @param options.toEmail - Primary recipient email address (default: 'laurenpothuru@gmail.com')
 * @param options.recentLandlordPropertyIDs - List of property IDs to feature as recent landlord properties
 * @param options.lovedPropertyIds - List of property IDs to feature as loved properties
 * @param options.recentAreaPropertyIDs - List of property IDs to feature as recent area properties
 * @returns Promise that resolves when all email batches have been sent
 */
const sendEmailCampaign = async (options: EmailCampaignOptions = {}): Promise<void> => {
  const { subject = 'Check Out These New Apartments!', toEmail = 'laurenpothuru@gmail.com' } =
    options;

  // Load environment variables
  dotenv.config({ path: path.resolve(process.cwd(), '.env.dev') });

  const fromEmail = process.env.GLOBAL_FROM_EMAIL ?? 'laurenpothuru@gmail.com';
  const fromName = 'CU Apts';

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('Missing RESEND_API_KEY in environment variables');
    return;
  }

  const { API_BASE_URL } = process.env;

  /**
   * getPropertiesByIds
   * Fetches apartment data for a given list of property IDs.
   *
   * @param ids - List of apartment IDs to fetch from backend API
   * @returns List of ApartmentWithId objects
   *
   */
  const getPropertiesByIds = async (ids: string[]): Promise<ApartmentWithId[]> => {
    try {
      const idParam = ids.join(',');

      const response = await fetch(`${API_BASE_URL}/api/apts/${idParam}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch property data: ${response.statusText}`);
      }

      const data = await response.json();
      return data as ApartmentWithId[];
    } catch (error) {
      console.error('Error fetching properties:', error);
      return [];
    }
  };

  try {
    console.log(`Total users available in database: ${USERS.length}`);
    const validEmails = USERS.filter((user) => user.email && user.email.includes('@'));
    console.log(`Valid email addresses: ${validEmails.length}`);

    if (validEmails.length === 0) {
      console.error('No valid email addresses found!');
      return;
    }

    // loads chosen properties
    const recentLandlordProperties = options.recentLandlordPropertyIDs
      ? await getPropertiesByIds(options.recentLandlordPropertyIDs)
      : [];
    const lovedProperties = options.lovedPropertyIds
      ? await getPropertiesByIds(options.lovedPropertyIds)
      : [];
    const recentAreaProperties = options.recentAreaPropertyIDs
      ? await getPropertiesByIds(options.recentAreaPropertyIDs)
      : [];

    console.log(
      `Fetched ${recentLandlordProperties.length} recent properties (landlord highlight), ${lovedProperties.length} loved properties (landlord highlight), and ${recentAreaProperties.length} recent properties (area spotlight).`
    );

    const resend = new Resend(apiKey);

    // Removed userFilter parameter from getUserBatches call
    const userBatches = await getUserBatches(50);
    console.log(
      `Preparing to send emails to ${userBatches.length} batches of users (${50} per batch)`
    );

    // Send to each batch
    const emailPromises = userBatches.map(async (batch, i) => {
      const bccEmails = batch.map((user) => user.email);
      console.log(
        `Preparing batch ${i + 1}/${userBatches.length} with ${bccEmails.length} recipients`
      );

      const { data, error } = await resend.emails.send({
        from: `${fromName} <${fromEmail}>`,
        to: toEmail,
        // bcc: bccEmails,
        subject,
        react: React.createElement(GenerateNewsletter, {
          recentLandlordProperties,
          lovedProperties,
          recentAreaProperties,
        }),
      });

      if (error) {
        console.error(`Error sending batch ${i + 1}:`, error);
      } else {
        console.log(`Batch ${i + 1} sent successfully! ID:`, data?.id || 'no ID returned');
      }
    });

    await Promise.all(emailPromises);
    console.log('All email batches sent successfully!');
  } catch (err) {
    console.error('Exception when sending emails:', err);
    throw err;
  }
};

/**
 * main
 * Entry point function that executes the email campaign with default settings.
 * Handles logging and error handling for the campaign process.
 *
 * @returns Promise that resolves when the campaign completes
 */
async function main() {
  try {
    console.log('Starting email campaign...');

    // Customize  email subject
    await sendEmailCampaign({
      subject: 'New Apartment Listings Available!',
    });

    console.log('Campaign completed successfully!');
  } catch (error) {
    console.error('Failed to send campaign:', error);
  }
}

// Execute main function directly
main().catch(console.error);
