/**
 * Rules engine
 * @author mtownsend
 * @since January 04, 2022
 * @flow
 **/
import type { Place } from './place.js';

export type RulePredicate = (user: any, place?: Place) => boolean;

export const Rule = {
  hasTag: (tag:string):RulePredicate =>
    user => user?.tags?.includes(tag),
  minSponsors: (min:number):RulePredicate => 
    user => user && (user.sponsors.length >= min || user.isAnchor),
  isOwner: ():RulePredicate =>
    (user, place) => !!user && !!place && place.owner === user.email
};

export const evaluate = (rules:Array<RulePredicate>, req:any):boolean => {
  for (const rule of rules) {
    if (!rule(req.user)) {
      return false;
    }
  }
  return true;
};

