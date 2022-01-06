/**
 * Rules engine
 * @author mtownsend
 * @since January 04, 2022
 * @flow
 **/
import type { Place } from './place.js';
import type { Tagged } from '../util.js';

export type RulePredicate = (user: Tagged<any>, place?: ?Tagged<Place>) => boolean;
export type RuleDefinition = {|
  type: $Keys<typeof Rule>,
  value?: any
|};

export const Rule:{ [string]: any => RulePredicate } = {
  hasTag: (tag = 'nyan') =>
    user => user?.tags?.includes(tag),
  minSponsors: (min = 1) => 
    user => user && (user.sponsors.length >= Number(min) || user.isAnchor),
  isOwner: () =>
    (user, place) => !!user && !!place && place.owner === user.email
};

export const parse = (definitions:Array<RuleDefinition>):Array<RulePredicate> => {
  const rules = definitions.map(def => {
    const rule = Rule[def.type];
    return rule(def.value);
  });
  rules.push(Rule.isOwner());
  return rules;
}

export const evaluate = (rules:Array<RulePredicate>, user:Tagged<any>, place:?Tagged<Place> = null):boolean => {
  for (const rule of rules) {
    if (rule(user, place)) {
      return true;
    }
  }
  return false;
};

