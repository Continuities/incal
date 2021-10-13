/**
 * Handles outgoing emails through a local SMTP server
 * @author mtownsend
 * @since October 12, 2021
 * @flow
 **/

import nodemailer from 'nodemailer';
import type { Invite } from './sponsorship.js';

const FROM = String(process.env.MAIL_FROM);
const SUBJECT = String(process.env.MAIL_SUBJECT);

const transporter = nodemailer.createTransport({
    host: 'smtp',
    port: 25,
    secure: false,
    tls: { rejectUnauthorized: false },
    debug: true, // TODO
});

export const sendInvite = async (invite:Invite) => {
  await transporter.verify();
  const info = await transporter.sendMail({
    from: FROM,
    to: invite.to,
    subject: SUBJECT,
    html: `
      You've got an invite to a secret new thing! 
      <a href='${String(process.env.SERVER_URI)}/oauth/invite?slug=${invite.slug}'>
        Click here!
      </a>
    `
  });
  console.log(info);
};