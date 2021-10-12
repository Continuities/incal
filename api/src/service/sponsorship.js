/**
 * Business logic for sponsorship
 * @author mtownsend
 * @since October 09, 2021
 * @flow
 **/

import collection from './db.js';
import { getSponsees } from './user.js';
import type { User } from './user.js';

const MAX_SPONSORS = parseInt(process.env.MAX_SPONSORS) || 0;
const MAX_SPONSEES = parseInt(process.env.MAX_SPONSEES) || 0;
const TO_SPONSOR = parseInt(process.env.TO_SPONSOR) || 0;
const TO_FULL_SPONSOR = parseInt(process.env.TO_FULL_SPONSOR) || 0;

const maxSponsees = (numSponsors:number, isAnchor:bool):number => {
  if (isAnchor) {
    return MAX_SPONSEES;
  }
  if (numSponsors < TO_SPONSOR) {
    return 0;
  }
  if (numSponsors < TO_FULL_SPONSOR) {
    return 1;
  }
  return MAX_SPONSEES;
};

export const canSponsor = async (sponsor:?User, user?:?User):Promise<bool> => {
  if (!sponsor) {
    return false;
  }

  const existingSponsees = (await getSponsees(sponsor.email)).length;

  if (existingSponsees >= maxSponsees(sponsor.sponsors.length, sponsor.tags.includes('anchor'))) {
    return false;
  }

  if (!user) {
    return true;
  }

  if (user.tags.includes('anchor')) {
    return false;
  }

  // TODO: Cycle prevention
  if (user.sponsors.length >= MAX_SPONSORS ||
      user.sponsors.find(s => s.email === sponsor.email) || 
      sponsor.sponsors.find(s => s.email === user.email)) {
    return false;
  }

  return true;
};

export const authorise = async (req:any, res:any, next:any):Promise<empty> => {
  const { user } = req.session;
  if (!user || user.tags.includes('orphan')) {
    return res.sendStatus(401);
  }
  return next();
}