import express from 'express';
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.static(__dirname));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "form.html"));
});

app.post("/generate-pdf", async (req, res) => {
  const data = req.body;
  const time = `${data.hour}:${data.minute}`;
  const hun = data.hungarian === "igen";
  const showCustom = data.displayOption === "custom";
  const showText = showCustom ? data.customText : `${data.kiszalldij} Ft`;

  const htmlContent = `
    <html>
    <head>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display&display=swap');
        body {
          font-family: 'Playfair Display', serif;
          padding: 50px;
          font-size: 13pt;
          color: #333;
        }
        h1 {
          font-size: 24pt;
          margin-bottom: 10px;
          color: #c29898;
        }
        h2 {
          font-size: 18pt;
          margin-top: 30px;
          color: #a27878;
        }
        ul {
          padding-left: 20px;
          line-height: 1.6;
        }
        .row {
          display: flex;
          justify-content: space-between;
        }
        .right-img {
          max-width: 40%;
          margin-left: 30px;
          align-self: flex-start;
        }
        .logo {
          width: 140px;
          margin-bottom: 30px;
        }
      </style>
    </head>
    <body>
      <img class="logo" src="file://${__dirname}/logo.png">
      <h1>Kedves ${data.bride} & ${data.groom}!</h1>
      <p>Örömmel küldöm el szertartásvezetői ajánlatomat a magyar nyelvű esküvőtökhöz. Az Angel Ceremony által megálmodott 30 perc varázslat lesz – egy felejthetetlen élmény, ami megalapozza az egész nap ünnepi hangulatát.</p>

      <h2>Az esküvő részletei</h2>
      <div class="row">
        <ul>
          <li>Dátum: ${data.date}</li>
          <li>Időpont: ${time}</li>
          <li>Helyszín: ${data.location}</li>
          <li>Távolság: ${data.distance} km</li>
          <li>Vendégek száma: ${data.guests} fő</li>
          <li>Csomag: ${data.selectedPackage}</li>
          <li>${hun ? "Kiszállási díj" : "Utazási költség"}: ${showText}</li>
        </ul>
        <img class="right-img" src="file://${__dirname}/Anita.png">
      </div>

      <h2>Személyre szabott ceremónia</h2>
      <p>Az esküvőtök napja egy életre szóló közös emlék lesz – és minden egyes pillanata rólatok fog szólni. Általam vezetett szertartás mindig teljesen személyre szabott, ezért nincs két egyforma esketés.</p>
      <p>Az első egyeztetés során (személyesen vagy online) átbeszéljük az elképzeléseiteket, átnézzük a szerződést és tisztázzuk a részleteket. Ezt követően mindketten írtok nekem egy e-mailt, amiben megosztjátok a megismerkedésetek történetét, fontos momentumokat, és minden olyan információt, ami egy igazán bensőséges szertartáshoz szükséges – beleértve a fogadalmat, közös momentumot vagy szülőköszöntőt is.</p>
      <p>A szertartásotok forgatókönyvét, zenei koreográfiáját is közösen alakítjuk ki – úgy, hogy az valóban a ti történeteteket mesélje el.</p>
      <p><strong>Fontos tudnivaló:</strong> Szertartásvezetőként szimbolikus esketést tartok, amelyhez szükséges, hogy az anyakönyvi házasságkötés már korábban megtörténjen, legalább 30 nappal előtte jelezve a házasságkötési szándékot az illetékes hivatalnál.<br>
      A hivatalos anyakönyvi kivonatot kérlek, küldjétek el e-mailben lefotózva legkésőbb az esküvő előtt 5 nappal (szükség esetén akár az esküvő napján is elfogadom).</p>
    </body>
    </html>
  `;

  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: "networkidle0" });
  const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
  await browser.close();

  res.contentType("application/pdf");
  res.send(pdfBuffer);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log("Szerver fut a " + PORT + " porton");
});