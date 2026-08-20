import crypto from "crypto";

const CAPTCHA_SECRET = process.env.SESSION_SECRET || "northeastconnect-captcha-secret-key-2026";

// Generate HMAC signature for captcha verification
export function generateCaptchaToken(answer: string): { key: string; expiresAt: number } {
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes validity
  const payload = `${answer.toLowerCase().trim()}:${expiresAt}`;
  const hmac = crypto.createHmac("sha256", CAPTCHA_SECRET).update(payload).digest("hex");
  const key = Buffer.from(`${payload}:${hmac}`).toString("base64");
  return { key, expiresAt };
}

// Verify HMAC token against user answer
export function verifyCaptchaToken(userAnswer: string, key: string): boolean {
  if (!userAnswer || !key) return false;
  try {
    const decoded = Buffer.from(key, "base64").toString("utf-8");
    const [expectedAnswer, expiresAtStr, hmac] = decoded.split(":");
    const expiresAt = parseInt(expiresAtStr, 10);

    if (Date.now() > expiresAt) {
      return false; // Expired
    }

    const payload = `${expectedAnswer}:${expiresAt}`;
    const expectedHmac = crypto.createHmac("sha256", CAPTCHA_SECRET).update(payload).digest("hex");

    if (hmac !== expectedHmac) {
      return false; // Tampered
    }

    return userAnswer.toLowerCase().trim() === expectedAnswer.toLowerCase().trim();
  } catch {
    return false;
  }
}

// Generate random 4-character alphanumeric string without ambiguous characters
function getRandomCaptchaText(length = 4): string {
  const chars = "23456789ABCDEFGHJKMNPQRSTUVWXYZ"; // removed 0, O, 1, I, L
  let text = "";
  for (let i = 0; i < length; i++) {
    text += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return text;
}

// Vibrant colors for captcha characters
const CHAR_COLORS = ["#34d399", "#38bdf8", "#fbbf24", "#f472b6", "#a78bfa", "#4ade80"];

// Generate pure SVG without any external font file dependencies
export function createSvgCaptcha(text?: string) {
  const code = text || getRandomCaptchaText(4);
  const width = 130;
  const height = 44;

  // Background noise lines
  let noiseLines = "";
  for (let i = 0; i < 4; i++) {
    const x1 = Math.floor(Math.random() * 20);
    const y1 = Math.floor(Math.random() * height);
    const x2 = Math.floor(width - Math.random() * 20);
    const y2 = Math.floor(Math.random() * height);
    const stroke = CHAR_COLORS[Math.floor(Math.random() * CHAR_COLORS.length)];
    const strokeWidth = 1 + Math.random() * 1.5;
    const opacity = 0.3 + Math.random() * 0.4;
    noiseLines += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-opacity="${opacity}" stroke-linecap="round" />`;
  }

  // Noise dots
  let noiseDots = "";
  for (let i = 0; i < 18; i++) {
    const cx = Math.floor(Math.random() * width);
    const cy = Math.floor(Math.random() * height);
    const r = 1 + Math.random() * 1.2;
    const fill = CHAR_COLORS[Math.floor(Math.random() * CHAR_COLORS.length)];
    const opacity = 0.2 + Math.random() * 0.5;
    noiseDots += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" fill-opacity="${opacity}" />`;
  }

  // Render stylized text characters with random rotation and offsets
  let textElements = "";
  const charSpacing = width / (code.length + 1);

  for (let i = 0; i < code.length; i++) {
    const char = code[i];
    const x = Math.floor((i + 0.8) * charSpacing);
    const y = 30 + Math.floor((Math.random() - 0.5) * 6);
    const rot = Math.floor((Math.random() - 0.5) * 28);
    const color = CHAR_COLORS[i % CHAR_COLORS.length];

    textElements += `
      <text
        x="${x}"
        y="${y}"
        fill="${color}"
        font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace"
        font-size="26"
        font-weight="900"
        letter-spacing="2"
        text-anchor="middle"
        transform="rotate(${rot} ${x} ${y})"
        style="text-shadow: 0 0 6px ${color}66;"
      >
        ${char}
      </text>
    `;
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="border-radius: 12px; background: #090d16; user-select: none;">
      <rect width="100%" height="100%" fill="#090d16" rx="12" />
      <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
        <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#1e293b" stroke-width="0.5"/>
      </pattern>
      <rect width="100%" height="100%" fill="url(#grid)" opacity="0.6" />
      ${noiseLines}
      ${noiseDots}
      ${textElements}
    </svg>
  `.trim();

  const { key } = generateCaptchaToken(code);

  return {
    svg,
    captchaKey: key,
    code,
  };
}
