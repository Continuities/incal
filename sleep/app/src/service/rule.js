/**
 * Logic and data for sharing rules
 * @author mtownsend
 * @since January 06, 2022
 * @flow
 **/

// TODO: Share models with sleep_api
export type RuleType = 'minSponsors'; // TODO: add more
export type RuleDefinition = {|
  label: string,
  valueType?:string
|};
export type Rule = {|
  type: RuleType,
  value?: any
|};

export const Rules:Map<RuleType, RuleDefinition> = new Map([
  [ 'minSponsors', { 
    label: 'Min. Sponsors',
    valueType: 'number'
  } ]
]);