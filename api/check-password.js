#!node

import bcrypt from 'bcrypt';

if (process.argv.length !== 4) {
  console.error('Usage: check-password.js PASSWORD HASH');
  process.exit(-1);
}

const [,,pass,hash] = process.argv;

bcrypt.compare(pass, hash).then(r => console.log(`${pass} == ${hash} ? ${r}`));