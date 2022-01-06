/**
 * UI for editing Place sharing rules
 * @author mtownsend
 * @since January 06, 2022
 * @flow
 **/

import React from 'react';
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableFooter,
  TableContainer,
  IconButton,
  Select,
  MenuItem,
  TextField
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { Rules } from '@service/rule';

import type { Rule } from '@service/rule';

type Props = {|
  rules: Array<Rule>,
  onAdd: Rule => void,
  onDelete: number => void,
  onChange: (index:number, value:Rule) => void
|};
const RulesEditor = ({ rules, onAdd, onDelete, onChange }: Props):React$Node => {
  return (
    <TableContainer>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell colSpan={2}>
            Share with...
          </TableCell>
          <TableCell align='right'>
            <IconButton onClick={() => onAdd({ type: 'minSponsors', value: 1 })}>
              <Add />
            </IconButton>
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rules.map((rule, i) => {
          const def = Rules.get(rule.type);
          return (
            <TableRow key={i}>
              <TableCell>
                <Select 
                  margin='dense' 
                  value={rule.type}
                  onChange={e => {
                    onChange(i, { type: e.target.value })
                  }}
                >
                  {[...Rules].map(([ t, d ]) => (
                    <MenuItem key={t} value={t}>{d.label}</MenuItem>
                  ))}
                </Select>
              </TableCell>
              <TableCell>
                {def?.valueType && (
                  <TextField 
                    margin='dense'
                    required
                    type={def.valueType} 
                    value={rule.value}
                    onChange={e => {
                      onChange(i, { ...rule, value: e.target.value })
                    }}/>
                )}
              </TableCell>
              <TableCell align='right'>
                <IconButton onClick={() => onDelete(i)}>
                  <Delete />
                </IconButton>
              </TableCell>
            </TableRow>
          );
        })}
        {rules.length === 0 && (
          <TableRow>
            <TableCell align='center' colSpan={3}>This place is private</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
    </TableContainer>
  );
};

export default RulesEditor;