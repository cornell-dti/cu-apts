/* eslint-disable import/prefer-default-export */
import { Resend } from 'resend';
import * as dotenv from 'dotenv';
import fetch, { Headers, Response, Request } from 'node-fetch';
import * as path from 'path';
import React from 'react';
import { ApartmentWithId } from '@common/types/db-types';
import GenerateNewsletter from './templates/GenerateNewsletter';
import { getUserBatches, USERS } from './helpers/firebase_users_loader';
import { NewsletterRequest } from './templates/Types';

if (!global.fetch) {
  global.fetch = fetch as unknown as typeof global.fetch;
  global.Headers = Headers as unknown as typeof global.Headers;
  global.Response = Response as unknown as typeof global.Response;
  global.Request = Request as unknown as typeof global.Request;
}

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

type EmailCampaignOptions = {
  subject?: string;
  toEmail?: string;
  nearbyPropertyIDs?: string[];
  budgetPropertyIDs?: string[];
  recentAreaPropertyIDs?: string[];
  lovedPropertyIDs?: string[];
  reviewedPropertyIDs?: string[];
  newsletterData?: NewsletterRequest;
};

const sendEmailCampaign = async (options: EmailCampaignOptions = {}): Promise<void> => {
  const {
    subject = 'Check Out These New Apartments!',
    toEmail = 'laurenpothuru@gmail.com',
    newsletterData,
  } = options;

  dotenv.config({ path: path.resolve(process.cwd(), '.env.dev') });

  const fromEmail = 'updates@cuapts.org';
  const fromName = 'CU Apts';

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('Missing RESEND_API_KEY in environment variables');
  }

  const getPropertiesByIds = async (ids: string[]): Promise<ApartmentWithId[]> => {
    if (!ids || ids.length === 0) return [];

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

  // Load properties
  const nearbyProperties = options.nearbyPropertyIDs
    ? await getPropertiesByIds(options.nearbyPropertyIDs)
    : [];
  const budgetProperties = options.budgetPropertyIDs
    ? await getPropertiesByIds(options.budgetPropertyIDs)
    : [];
  const recentAreaProperties = options.recentAreaPropertyIDs
    ? await getPropertiesByIds(options.recentAreaPropertyIDs)
    : [];
  const lovedProperties = options.lovedPropertyIDs
    ? await getPropertiesByIds(options.lovedPropertyIDs)
    : [];
  const reviewedProperties = options.reviewedPropertyIDs
    ? await getPropertiesByIds(options.reviewedPropertyIDs)
    : [];

  console.log(`Fetched ${nearbyProperties.length} nearby properties`);
  console.log(`Fetched ${budgetProperties.length} budget properties`);
  console.log(`Fetched ${recentAreaProperties.length} recent area properties`);
  console.log(`Fetched ${lovedProperties.length} loved properties`);
  console.log(`Fetched ${reviewedProperties.length} reviewed properties`);

  const resend = new Resend(apiKey);

  const sendBatchEmail = async () => {
    try {
      console.log(`Total users available: ${USERS.length}`);
      const validEmails = USERS.filter((user) => user.email && user.email.includes('@'));
      console.log(`Valid email addresses: ${validEmails.length}`);

      if (validEmails.length === 0) {
        throw new Error('No valid email addresses found!');
      }

      const userBatches = await getUserBatches(50);
      console.log(`Sending to ${userBatches.length} batches of users`);

      const emailPromises = userBatches.map(async (batch, i) => {
        const bccEmails = batch.map((user) => user.email);

        const { data, error } = await resend.emails.send({
          from: `${fromName} <${fromEmail}>`,
          to: toEmail,
          bcc: bccEmails,
          subject,
          react: React.createElement(GenerateNewsletter, {
            nearbyProperties,
            budgetProperties,
            recentAreaProperties,
            lovedProperties,
            reviewedProperties,
            newsletterData,
          }),
        });

        if (error) {
          console.error(`Error sending batch ${i + 1}:`, error);
          throw error;
        } else {
          console.log(`Batch ${i + 1} sent successfully! ID:`, data?.id);
        }
      });

      await Promise.all(emailPromises);
      console.log('All email batches sent successfully!');
    } catch (err) {
      console.error('Exception when sending emails:', err);
      throw err;
    }
  };

  const sendSingleTestEmail = async () => {
    try {
      const { data, error } = await resend.emails.send({
        from: `${fromName} <${fromEmail}>`,
        to: toEmail,
        subject,
        react: React.createElement(GenerateNewsletter, {
          nearbyProperties,
          budgetProperties,
          recentAreaProperties,
          lovedProperties,
          reviewedProperties,
          newsletterData,
        }),
      });

      if (error) {
        console.error('Error sending email:', error);
        throw error;
      } else {
        console.log('Email sent successfully! ID:', data?.id);
      }
    } catch (err) {
      console.error('Exception when sending email:', err);
      throw err;
    }
  };

  // Determine which sending method to use based on sendToAll flag
  // If newsletterData exists and sendToAll is true, send to all users
  // Otherwise, send a single test email
  const shouldSendToAll = newsletterData?.sendToAll === true;

  if (shouldSendToAll) {
    console.log('Sending to all subscribers...');
    await sendBatchEmail();
  } else {
    console.log(`Sending test email to: ${toEmail}`);
    await sendSingleTestEmail();
  }
};

export { sendEmailCampaign };
