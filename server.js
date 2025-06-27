import express from 'express';
import puppeteer from 'puppeteer';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'form.html'));
});

app.post('/generate-pdf', async (req, res) => {
  try {
    const { bride, groom, date, location, selectedPackage } = req.body;

    const html = `
      <html>
        <head>
          <style>
            body {
              font-family: Georgia, serif;
              padding: 40px;
              color: #333;
              max-width: 800px;
              margin: auto;
            }
            h1 {
              color: #a45d5d;
              text-align: center;
            }
            .section {
              margin-top: 30px;
            }
          </style>
        </head>
        <body>
          <h1>Esketési ajánlat</h1>
          <p><strong>Kedves ${bride} & ${groom}!</strong></p>
          <p>Örömmel küldöm el szertartásvezetői ajánlatomat a magyar nyelvű esküvőtökhöz.
          Az Angel Ceremony által megálmodott 30 perc varázslat lesz – egy felejthetetlen élmény,
          ami megalapozza az egész nap ünnepi hangulatát.</p>

          <div class="section">
            <h2>Az esküvő részletei:</h2>
            <ul>
              <li>Dátum: ${date}</li>
              <li>Helyszín: ${location}</li>
              <li>Választott csomag: ${selectedPackage}</li>
            </ul>
          </div>
        </body>
      </html>
    `;

    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });

    await browser.close();

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=ajanlat.pdf',
    });

    res.send(pdfBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).send('Hiba történt a PDF generálás során.');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Szerver fut a ${PORT} porton`));