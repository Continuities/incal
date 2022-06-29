#!node

import bcrypt from 'bcrypt';

if (process.argv.length !== 4) {
  console.error('Usage: hash-password.js PASSWORD SALTROUNDS');
  process.exit(-1);
}

const pass = process.argv[2];
const salts = parseInt(process.argv[3]);
if (isNaN(salts)) {
  console.error(`Invalid salt rounds ${process.argv[3]}`);
  process.exit(-1);
}

const hash = bcrypt.hash(pass, salts).then(console.log);