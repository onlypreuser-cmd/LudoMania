import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const UPLOAD_DIR = 'C:/Users/Shree2/.gemini/antigravity/brain/b8f8146a-435b-4f73-a2fa-4fb634f865d4/.user_uploaded';
const AVATARS_SRC = path.join(UPLOAD_DIR, 'media_1791865836714_f0e9fc5a.png');
const HERO_SRC = path.join(UPLOAD_DIR, 'media_1791865829029_2ee893a9.jpg');
const UI_REF_SRC = path.join(UPLOAD_DIR, 'media_1791865824061_62174cb2.jpg');

const OUT_DIR = path.resolve('public/assets');
const AVATARS_OUT_DIR = path.join(OUT_DIR, 'avatars');
const HERO_OUT_DIR = path.join(OUT_DIR, 'hero');
const TOKENS_OUT_DIR = path.join(OUT_DIR, 'tokens');

fs.mkdirSync(AVATARS_OUT_DIR, { recursive: true });
fs.mkdirSync(HERO_OUT_DIR, { recursive: true });
fs.mkdirSync(TOKENS_OUT_DIR, { recursive: true });

async function run() {
  // 1. Copy full high-res Hero Logo (media_1791865829029_2ee893a9.jpg)
  await sharp(HERO_SRC)
    .png()
    .toFile(path.join(HERO_OUT_DIR, 'ludo-mania-logo.png'));

  // 2. Re-crop the Home Hero Banner from UI_REF_SRC starting at top = 6.2%
  // so the entire Crown above Ludo MANIA and the castle sky are 100% uncut!
  const refMeta = await sharp(UI_REF_SRC).metadata();
  const bannerBox = {
    left: Math.round(refMeta.width * 0.022),
    top: Math.round(refMeta.height * 0.098),
    width: Math.round(refMeta.width * 0.308),
    height: Math.round(refMeta.height * 0.512),
  };
  await sharp(UI_REF_SRC)
    .extract(bannerBox)
    .png()
    .toFile(path.join(HERO_OUT_DIR, 'home-hero-banner.png'));
  console.log('Saved uncut home-hero-banner.png');

  // 3. Also crop the 8 Token character illustrations from the Customize card in UI_REF_SRC
  // Customize panel is located in bottom-middle-left of UI_REF_SRC
  // Row 1 (Classic, Knight, Dog, Cat): y ~ 72.5%..83.5%
  // Row 2 (Panda, Robot, Astronaut, Unicorn): y ~ 84.5%..95.5%
  const tokenNames = [
    ['classic', 'knight', 'dog', 'cat'],
    ['panda', 'robot', 'astronaut', 'unicorn'],
  ];
  const rowY = [0.722, 0.844];
  const colX = [0.351, 0.397, 0.444, 0.491];
  const cellW = 0.044;
  const cellH = 0.095;

  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 4; c++) {
      const name = tokenNames[r][c];
      const box = {
        left: Math.round(refMeta.width * colX[c]),
        top: Math.round(refMeta.height * rowY[r]),
        width: Math.round(refMeta.width * cellW),
        height: Math.round(refMeta.height * cellH),
      };
      await sharp(UI_REF_SRC)
        .extract(box)
        .resize(160, 180, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
        .png()
        .toFile(path.join(TOKENS_OUT_DIR, `${name}.png`));
      console.log(`Saved token preview -> public/assets/tokens/${name}.png`);
    }
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
