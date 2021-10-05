/**
 * Service for fetching/saving user info
 * @author mtownsend
 * @since October 05, 2021
 * @flow
 **/

export type User = {|
  // TODO
  username: string
|};

export const getUser = async (id:string) => {
  // TODO
  return {
    username: id
  };
};

export const saveUser = async () => {
  return 'TODO';
};