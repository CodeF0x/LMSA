import express from 'express';
import cors from 'cors';
import { getFirstIPv4 } from './ip.js';

const app = express();
const port = 3000;

app.use(express.static('.'));
app.use(cors());

app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/index.html`);
});

app.listen(port, '0.0.0.0', () => {
  const ip = getFirstIPv4();
  console.log(`LMWSA available via http://${ip ? ip : '<llm-server-ip>'}:${port} in your local network`);
});

