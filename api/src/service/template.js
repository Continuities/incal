/**
 * Very simple templating engine. 
 * I should probably replace this with a real one.
 * @author mtownsend
 * @since October 18, 2021
 * @flow
 **/
import { promises as fs } from 'fs';

export const renderTemplate = async (viewName:string, viewModel:any):Promise<string> => {
  // $FlowFixMe[incompatible-use] Flow doesn't know about import.meta.url
  const template = (await fs.readFile(new URL(`../../static/${viewName}.html`, import.meta.url))).toString();
  if (!template) {
    throw `Ivalid template ${template}`;
  }
  return Object
    .entries(viewModel)
    .reduce((html, variable) => html.replace(
        new RegExp(`%{${variable[0]}}`, 'g'), 
        String(variable[1])
      ), template);
};