import express from 'express';
import cors from 'cors';

const app = express();
const port = 3000;

app.use(express.static('.'));
app.use(cors());

app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/index.html`);
});

app.listen(port, '0.0.0.0', () => {
  console.log(`LMSA available via http://<llm-server-ip>:${port} in your local network`);
});

