/**
 * Handles outgoing emails through a local SMTP server
 * @author mtownsend
 * @since October 12, 2021
 * @flow
 **/

import nodemailer from 'nodemailer';
import { getUser } from './user.js';
import { renderTemplate } from './template.js';
import type { Invite } from './sponsorship.js';
import type { PasswordResetRequest } from './user.js';

const FROM = String(process.env.MAIL_FROM);
const SUBJECT = String(process.env.MAIL_SUBJECT);
const FORGOT_SUBJECT = String(process.env.FORGOT_SUBJECT);
const SMTP_HOST = process.env.SMTP_HOST ?? 'smtp';
const SMTP_PORT = process.env.SMTP_PORT ?? 25;
const SMTP_USERNAME = process.env.SMTP_USERNAME ?? '';
const SMTP_PASSWORD = process.env.SMTP_PASSWORD ?? '';


const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: false,
    tls: { rejectUnauthorized: false },
    auth: {
      user: SMTP_USERNAME,
      pass: SMTP_PASSWORD
    }
});

export const sendInvite = async (invite:Invite) => {
  const from = await getUser(invite.from);
  if (!from) {
    throw `Invalid user ${invite.from}`;
  }
  await transporter.verify();
  const html = await renderTemplate('invite-email', {
    community: String(process.env.COMMUNITY_NAME),
    fromName: `${from.firstname} ${from.lastname}`,
    toEmail: invite.to,
    link: `${String(process.env.SERVER_URI)}/oauth/invite?slug=${invite.slug}`
  });
  const info = await transporter.sendMail({
    from: {
      name: String(process.env.MAIL_FROM_NAME),
      address: FROM
    },
    to: invite.to,
    subject: SUBJECT,
    html
  });
};

export const sendReset = async (resetRequest:PasswordResetRequest) => {
  const user = await getUser(resetRequest.user);
  if (!user) {
    throw `Invalid user ${resetRequest.user}`;
  }
  await transporter.verify();
  const html = await renderTemplate('forgot-email', {
    community: String(process.env.COMMUNITY_NAME),
    firstName: user.firstname,
    link: `${String(process.env.SERVER_URI)}/oauth/reset?slug=${resetRequest.slug}`
  });
  const info = await transporter.sendMail({
    from: {
      name: String(process.env.MAIL_FROM_NAME),
      address: FROM
    },
    to: resetRequest.user,
    subject: FORGOT_SUBJECT,
    html
  });
};