/**
 * Service for fetching/saving user info
 * @author mtownsend
 * @since October 05, 2021
 * @flow
 **/

export type User = {|
  email: string,
  firstname: string,
  lastname: string,
  sponsors: Array<string>
|};

export const getUser = async (email:string):Promise<?User> => {
  // TODO: actual lookup
  return {
    email,
    firstname: 'Test',
    lastname: 'User',
    sponsors: ['foo@foo.com', 'bar@bar.com', 'baz@baz.com']
  };
};

export const saveUser = async () => {
  return 'TODO';
};