/**
 * Utils
 * @author mtownsend
 * @since January 04, 2022
 * @flow
 **/
 
export type Tagged<T> = {|
  ...T,
  tags: Array<string>
|};