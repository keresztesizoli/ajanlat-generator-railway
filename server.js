import express from 'express';
import bodyParser from 'body-parser';
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 8080;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));

app.post('/generate-pdf', async (req, res) => {
  const {
    bride, groom, date, hour, minute, location,
    distance, hungarian, guests, selectedPackage,
    kmdij, kiszalldij, customText
  } = req.body;

  const useCustomText = hungarian === 'nem';
  const csomagSzovegek = {
    "Alapcsomag": "Letisztult, klasszikus szertartás, kb. 30 percben. Alap szöveg, egyéni részletek nélkül.",
    "Prémium csomag": "A Prémium csomagban már lehetőség van közös momentum beillesztésére, egyéni szövegrészletre és zenei aláfestésre.",
    "Exkluzív csomag": "Egyedi forgatókönyv szerint felépített szertartás, akár többszöri egyeztetéssel, zenékkel és különleges elemekkel."
  };

  const html = `
    <html>
    <head>
      <style>
        body {
          font-family: 'Georgia', serif;
          padding: 40px;
          background-color: white;
          color: #444;
          font-size: 12pt;
        }
        h1 {
          color: #a45d5d;
          font-size: 20pt;
        }
        h2 {
          margin-top: 30px;
          color: #a45d5d;
        }
        .részletek {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-top: 20px;
        }
        ul {
          padding-left: 20px;
        }
        .jobb-oldal {
          margin-left: 20px;
          flex-shrink: 0;
        }
        .jobb-oldal img {
          width: 200px;
          object-fit: contain;
        }
        .section {
          margin-top: 30px;
        }
      </style>
    </head>
    <body>
      <img src="logo.png" style="height: 60px; margin-bottom: 30px;" />
      <h1>Kedves ${bride} & ${groom}!</h1>
      <p>Örömmel küldöm el szertartásvezetői ajánlatomat a magyar nyelvű esküvőtökhöz. Az Angel Ceremony által megálmodott 30 perc varázslat lesz – egy felejthetetlen élmény, ami megalapozza az egész nap ünnepi hangulatát.</p>

      <h2>Az esküvő részletei</h2>
      <div class="részletek">
        <ul>
          <li><strong>Dátum:</strong> ${date}</li>
          <li><strong>Időpont:</strong> ${hour}:${minute}</li>
          <li><strong>Helyszín:</strong> ${location}</li>
          <li><strong>Távolság:</strong> ${distance} km</li>
          <li><strong>Vendégek száma:</strong> ${guests}</li>
          <li><strong>Magyarországi helyszín:</strong> ${hungarian}</li>
          <li><strong>Km-díj:</strong> ${kmdij} Ft/km</li>
          <li><strong>Kiszállási díj:</strong> ${kiszalldij} Ft</li>
        </ul>
        <div class="jobb-oldal">
          <img src="Anita.png" />
        </div>
      </div>

      <div class="section">
        <h2>Személyre szabott ceremónia</h2>
        <p>Az esküvőtök napja egy életre szóló közös emlék lesz – és minden egyes pillanata rólatok fog szólni. Általam vezetett szertartás mindig teljesen személyre szabott, ezért nincs két egyforma esketés.</p>
        <p>Az első egyeztetés során (személyesen vagy online) átbeszéljük az elképzeléseiteket, átnézzük a szerződést és tisztázzuk a részleteket. Ezt követően mindketten írtok nekem egy e-mailt, amiben megosztjátok a megismerkedésetek történetét, fontos momentumokat, és minden olyan információt, ami egy igazán bensőséges szertartáshoz szükséges – beleértve a fogadalmat, közös momentumot vagy szülőköszöntőt is.</p>
        <p>A szertartásotok forgatókönyvét, zenei koreográfiáját is közösen alakítjuk ki – úgy, hogy az valóban a ti történeteteket mesélje el.</p>
        <p><strong>Fontos tudnivaló:</strong> Szertartásvezetőként szimbolikus esketést tartok, amelyhez szükséges, hogy az anyakönyvi házasságkötés már korábban megtörténjen, legalább 30 nappal előtte jelezve a házasságkötési szándékot az illetékes hivatalnál.
        A hivatalos anyakönyvi kivonatot kérlek, küldjétek el e-mailben lefotózva legkésőbb az esküvő előtt 5 nappal (szükség esetén akár az esküvő napján is elfogadom).</p>
      </div>

      <div class="section">
        <h2>Ajánlott csomag: ${selectedPackage}</h2>
        <p>${csomagSzovegek[selectedPackage]}</p>
      </div>

      ${useCustomText ? `<div class="section"><strong>Külföldi helyszín esetén:</strong> ${customText}</div>` : ""}
    </body>
    </html>
  `;

  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox']
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=ajanlat.pdf');
    res.send(pdf);
  } catch (err) {
    res.status(500).send("A server error has occurred");
  }
});

app.listen(PORT, () => {
  console.log(`Szerver fut a ${PORT} porton`);
});