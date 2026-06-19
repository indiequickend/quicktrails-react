import { jsPDF } from 'jspdf';

// ─── Layout constants (all in mm) ────────────────────────────────
const W = 210;
const H = 297;
const M = 12;                          // side margin
const COL_GAP = 8;
const COL_W = (W - M * 2 - COL_GAP) / 2; // ≈ 89 mm per column

// ─── Palette ─────────────────────────────────────────────────────
const SLATE = [15, 23, 42];
const SLATM = [51, 65, 85];
const AMBER = [251, 191, 36];
const WHITE = [255, 255, 255];
const LGRAY = [148, 163, 184];
const LLGRAY = [226, 232, 240];

// pt → mm line height
const lh = (pt, spacing = 1.18) => pt * 0.3528 * spacing;

// ─── Font loader ─────────────────────────────────────────────────
function ab2b64(buf) {
    const bytes = new Uint8Array(buf);
    let bin = '';
    for (let i = 0; i < bytes.byteLength; i += 8192)
        bin += String.fromCharCode(...bytes.subarray(i, Math.min(i + 8192, bytes.byteLength)));
    return btoa(bin);
}

async function loadFont(pdf) {
    const BASE = '/fonts/';
    try {
        const [bRes, rRes] = await Promise.all([
            fetch(`${BASE}PlayfairDisplay-Bold.ttf`),
            fetch(`${BASE}PlayfairDisplay-Regular.ttf`),
        ]);
        // fetch() resolves on 404 — must check ok explicitly before reading body
        if (!bRes.ok || !rRes.ok) throw new Error(`Font fetch failed (${bRes.status}/${rRes.status})`);
        const [bBuf, rBuf] = await Promise.all([bRes.arrayBuffer(), rRes.arrayBuffer()]);
        pdf.addFileToVFS('PF-Bold.ttf', ab2b64(bBuf));
        pdf.addFont('PF-Bold.ttf', 'Playfair', 'bold');
        pdf.addFileToVFS('PF-Regular.ttf', ab2b64(rBuf));
        pdf.addFont('PF-Regular.ttf', 'Playfair', 'normal');
        return 'Playfair';
    } catch (e) {
        console.warn('Playfair Display unavailable, falling back to Times:', e.message);
        return 'times';
    }
}

// ─── Image helpers ────────────────────────────────────────────────

// Cover: cover-crop to A4 proportions, bake in dark gradient overlay
async function loadCoverPhoto(url) {
    const PX_W = 992, PX_H = 1406;
    if (!url) return null;
    return new Promise(resolve => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const cvs = document.createElement('canvas');
            cvs.width = PX_W; cvs.height = PX_H;
            const ctx = cvs.getContext('2d');
            const s = Math.max(PX_W / img.naturalWidth, PX_H / img.naturalHeight);
            ctx.drawImage(img,
                (img.naturalWidth - PX_W / s) / 2,
                (img.naturalHeight - PX_H / s) / 2,
                PX_W / s, PX_H / s,
                0, 0, PX_W, PX_H);
            const grad = ctx.createLinearGradient(0, PX_H * 0.28, 0, PX_H);
            grad.addColorStop(0, 'rgba(8,15,30,0)');
            grad.addColorStop(0.35, 'rgba(8,15,30,0.42)');
            grad.addColorStop(0.65, 'rgba(8,15,30,0.72)');
            grad.addColorStop(1, 'rgba(8,15,30,0.90)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, PX_W, PX_H);
            const topGrad = ctx.createLinearGradient(0, 0, 0, PX_H * 0.22);
            topGrad.addColorStop(0, 'rgba(8,15,30,0.72)');
            topGrad.addColorStop(1, 'rgba(8,15,30,0)');
            ctx.fillStyle = topGrad;
            ctx.fillRect(0, 0, PX_W, PX_H * 0.22);
            resolve(cvs.toDataURL('image/jpeg', 0.88));
        };
        img.onerror = () => resolve(null);
        img.src = url;
    });
}

// Activity / day photos: cover-crop to exact pixel dimensions
async function loadPhoto(url, pxW, pxH, quality = 0.82) {
    if (!url) return null;
    return new Promise(resolve => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const cvs = document.createElement('canvas');
            cvs.width = pxW; cvs.height = pxH;
            const ctx = cvs.getContext('2d');
            const s = Math.max(pxW / img.naturalWidth, pxH / img.naturalHeight);
            ctx.drawImage(img,
                (img.naturalWidth - pxW / s) / 2,
                (img.naturalHeight - pxH / s) / 2,
                pxW / s, pxH / s,
                0, 0, pxW, pxH);
            resolve(cvs.toDataURL('image/jpeg', quality));
        };
        img.onerror = () => resolve(null);
        img.src = url;
    });
}

// Logo: PNG to preserve transparency, returns { dataUrl, aspect }
async function loadLogo(url) {
    if (!url) return null;
    return new Promise(resolve => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const MAX = 600;
            const s = Math.min(1, MAX / img.naturalWidth);
            const w = Math.round(img.naturalWidth * s);
            const h = Math.round(img.naturalHeight * s);
            const cvs = document.createElement('canvas');
            cvs.width = w; cvs.height = h;
            cvs.getContext('2d').drawImage(img, 0, 0, w, h);
            resolve({ dataUrl: cvs.toDataURL('image/png'), aspect: w / h });
        };
        img.onerror = () => resolve(null);
        img.src = url;
    });
}

// ─── Cover page ───────────────────────────────────────────────────
async function drawCover(pdf, data, serif) {
    const { tripTitle, durationText, totalPrice, heroImage, activeLogoUrl, activeAgencyName } = data;

    // Slate background (shows if no hero image)
    pdf.setFillColor(...SLATE);
    pdf.rect(0, 0, W, H, 'F');

    // Hero photo with gradient baked in
    if (heroImage) {
        const img = await loadCoverPhoto(heroImage);
        if (img) pdf.addImage(img, 'JPEG', 0, 0, W, H);
    }

    // ── Top bar: logo + agency name ──────────────────────────────
    const TOP_Y = 17;
    const LOGO_H = 9;  // mm display height
    let agencyX = M;

    const logo = await loadLogo(activeLogoUrl);
    if (logo) {
        const logoW = Math.min(LOGO_H * logo.aspect, 40);
        pdf.addImage(logo.dataUrl, 'PNG', M, TOP_Y - LOGO_H * 0.8, logoW, LOGO_H);
        agencyX = M + logoW + 3;
    }
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(...WHITE);
    pdf.text((activeAgencyName || '').toUpperCase(), agencyX, TOP_Y, { charSpace: 1.2 });

    // ── Text block ───────────────────────────────────────────────
    const BLK_Y = H * 0.695; // ≈ 206 mm

    // Amber accent line
    pdf.setDrawColor(...AMBER);
    pdf.setLineWidth(0.65);
    pdf.line(M, BLK_Y, M + 36, BLK_Y);

    // Duration label
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12.5);
    pdf.setTextColor(...AMBER);
    pdf.text((durationText || '').toUpperCase(), M, BLK_Y + 6, { charSpace: 1.8 });

    // Trip title — extra gap after duration label
    pdf.setFont(serif, 'bold');
    pdf.setFontSize(33);
    pdf.setTextColor(...WHITE);
    const titleLines = pdf.splitTextToSize(tripTitle || 'Untitled Journey', W - M * 2 - 8);
    const shownLines = titleLines.slice(0, 4);
    const TITLE_Y = BLK_Y + 20;
    pdf.text(shownLines, M, TITLE_Y);
    const titleBlockH = shownLines.length * lh(33);

    // Price
    if (totalPrice) {
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(17.5);
        pdf.setTextColor(...LGRAY);
        pdf.text(totalPrice, M, TITLE_Y + titleBlockH + 6);
    }

    // ── Bottom brand strip ───────────────────────────────────────
    drawPageFooter(pdf);
}

// ─── Day pages ───────────────────────────────────────────────────

const BAND_H = 36;   // mm — top header band height
const CARD_GAP = 5;    // mm — vertical gap between cards
const CARD_IMG_H = 52;   // mm — fixed activity image height
const CARD_PAD = 5;    // mm — horizontal padding inside card text area
const T_ACT_TITLE = 10;  // pt — activity title (orange bold)
const T_DESC = 8.5;  // pt — activity description

// Pre-compute actual card height for a given activity (drives masonry layout)
function computeCardHeight(pdf, act, colW) {
    const textW = colW - CARD_PAD * 2;
    const titleLines = pdf.splitTextToSize(act.title || '', textW);
    const titleH = lh(T_ACT_TITLE) * Math.min(titleLines.length, 2) + 3;
    let descH = 0;
    if (act.description) {
        const dLines = pdf.splitTextToSize(act.description, textW);
        descH = lh(T_DESC) * dLines.length + 2;
    }
    return CARD_IMG_H + 4 + titleH + descH + 5 + CARD_GAP;
}

// Draw the slate header band (reused when a day spills to a second page)
function drawDayBand(pdf, day, serif, isContinued = false) {
    // Background band
    pdf.setFillColor(...SLATE);
    pdf.rect(0, 0, W, BAND_H, 'F');

    // Amber left accent bar
    pdf.setFillColor(...AMBER);
    pdf.rect(0, 0, 3, BAND_H, 'F');

    // Day number circle
    const CX = 3 + 14, CY = BAND_H / 2;
    pdf.setFillColor(...AMBER);
    pdf.circle(CX, CY, 9, 'F');
    pdf.setFont(serif, 'bold');
    pdf.setFontSize(13);
    pdf.setTextColor(...SLATE);
    const numStr = String(day.dayNumber);
    pdf.text(numStr, CX, CY - 1 + lh(13) * 0.4, { align: 'center' });

    // "DAY N" small label
    const TX = CX + 13;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7);
    pdf.setTextColor(...AMBER);
    pdf.text(`DAY ${day.dayNumber}${isContinued ? ' (cont.)' : ''}`, TX, CY - 5, { charSpace: 1.2 });

    // Day title
    pdf.setFont(serif, 'bold');
    pdf.setFontSize(16);
    pdf.setTextColor(...WHITE);
    const titleLines = pdf.splitTextToSize(day.dayTitle || `Day ${day.dayNumber}`, W - TX - M);
    pdf.text(titleLines.slice(0, 2), TX, CY + 0.5);
}

// Shared page footer — called by every page type
function drawPageFooter(pdf) {
    pdf.setFillColor(...AMBER);
    pdf.rect(0, H - 5, W, 5, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(6);
    pdf.setTextColor(...SLATE);
    pdf.text('QUICKTRAILS', (W / 2) - 10, H - 1.5, { align: 'center', charSpace: 1.8 });
}

// Draw a single activity card — height supplied by caller (masonry pre-compute)
async function drawActivityCard(pdf, act, x, y, colW, cardH) {
    const bodyH = cardH - CARD_GAP;

    // Card background + border with rounded corners
    pdf.setFillColor(248, 250, 252);
    pdf.roundedRect(x, y, colW, bodyH, 2, 2, 'F');
    pdf.setDrawColor(...LLGRAY);
    pdf.setLineWidth(0.2);
    pdf.roundedRect(x, y, colW, bodyH, 2, 2, 'S');

    // Activity image (fixed height)
    const pxW = Math.round(colW / 25.4 * 150);
    const pxH = Math.round(CARD_IMG_H / 25.4 * 150);
    if (act.imageUrl) {
        const img = await loadPhoto(act.imageUrl, pxW, pxH);
        if (img) pdf.addImage(img, 'JPEG', x, y, colW, CARD_IMG_H);
        else { pdf.setFillColor(...LLGRAY); pdf.rect(x, y, colW, CARD_IMG_H, 'F'); }
    } else {
        pdf.setFillColor(...LLGRAY);
        pdf.rect(x, y, colW, CARD_IMG_H, 'F');
    }

    // Amber left accent on image
    pdf.setFillColor(...AMBER);
    pdf.rect(x, y, 3, CARD_IMG_H, 'F');

    const textX = x + CARD_PAD;
    const textW = colW - CARD_PAD * 2;
    let curY = y + CARD_IMG_H + 8;

    // Title in orange-bold style (replaces old Playfair title + tag row)
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(T_ACT_TITLE);
    pdf.setTextColor(180, 83, 9);
    const titleLines = pdf.splitTextToSize(act.title || '', textW);
    pdf.text(titleLines.slice(0, 2), textX, curY);
    curY += lh(T_ACT_TITLE) * Math.min(titleLines.length, 2) + 3;

    // Description — full text, no truncation, with proper horizontal padding
    if (act.description) {
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(T_DESC);
        pdf.setTextColor(...SLATM);
        const descLines = pdf.splitTextToSize(act.description, textW);
        pdf.text(descLines, textX, curY);
    }
}

// Draw all activities for a day using a masonry two-column layout
async function drawDayPage(pdf, day, serif, isFirstPage = true) {
    const isContinued = !isFirstPage;
    drawDayBand(pdf, day, serif, isContinued);

    const FOOTER_H = 5;
    const maxY = H - M - FOOTER_H;
    let startY = BAND_H + 5;

    // Full day description as a tinted block below the band (first page only)
    if (!isContinued && day.dayDescription) {
        pdf.setFont('helvetica', 'italic');
        pdf.setFontSize(10);
        pdf.setTextColor(...SLATM);
        const descW = W - M * 2;
        const lines = pdf.splitTextToSize(day.dayDescription, descW - 10);
        const boxH = lh(10) * lines.length + 7;
        pdf.setFillColor(241, 245, 249);
        pdf.rect(M, startY, descW, boxH, 'F');
        pdf.setFillColor(...AMBER);
        pdf.rect(M, startY, 2, boxH, 'F');
        pdf.text(lines, M + 6, startY + 4.5);
        startY += boxH + 5;
    }

    const activities = day.activities || [];
    if (activities.length === 0) {
        pdf.setFont('helvetica', 'italic');
        pdf.setFontSize(9);
        pdf.setTextColor(...LGRAY);
        pdf.text('No activities scheduled for this day.', M, startY + 8);
        drawPageFooter(pdf);
        return;
    }

    // Pre-compute each card's height for masonry placement
    const heights = activities.map(act => computeCardHeight(pdf, act, COL_W));

    // Masonry: greedily place each card in the shorter column
    let leftY = startY, rightY = startY;

    for (let i = 0; i < activities.length; i++) {
        const h = heights[i];
        const useLeft = leftY <= rightY;
        let targetY = useLeft ? leftY : rightY;
        let x = useLeft ? M : M + COL_W + COL_GAP;

        if (targetY + h > maxY) {
            drawPageFooter(pdf);
            pdf.addPage();
            drawDayBand(pdf, day, serif, true);
            leftY = BAND_H + 8;
            rightY = BAND_H + 8;
            targetY = leftY;
            x = M;
            leftY += h;
        } else {
            if (useLeft) leftY = targetY + h;
            else rightY = targetY + h;
        }

        await drawActivityCard(pdf, activities[i], x, targetY, COL_W, h);
    }

    // Hotel info below the taller column
    if (day.hotelInfo) {
        const hotelY = Math.max(leftY, rightY) + 4;
        if (hotelY + 10 < maxY) {
            pdf.setFillColor(...AMBER);
            pdf.rect(M, hotelY, 2, 8, 'F');
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(7.5);
            pdf.setTextColor(...SLATM);
            pdf.text('OVERNIGHT', M + 4, hotelY + 4, { charSpace: 1 });
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(8.5);
            pdf.setTextColor(...SLATE);
            pdf.text(day.hotelInfo, M + 4, hotelY + 8.5);
        }
    }

    drawPageFooter(pdf);
}

// ─── Inclusions / Exclusions page ────────────────────────────────

function drawInclusionsPage(pdf, inclusions, exclusions, serif) {
    // Slate top band (slimmer than day band)
    pdf.setFillColor(...SLATE);
    pdf.rect(0, 0, W, 24, 'F');
    pdf.setFillColor(...AMBER);
    pdf.rect(0, 0, 3, 24, 'F');
    pdf.setFont(serif, 'bold');
    pdf.setFontSize(16);
    pdf.setTextColor(...WHITE);
    pdf.text('What\'s Included', M + 4, 16);

    const COL_L = M;
    const COL_R = W / 2 + 4;
    let leftY = 34;
    let rightY = 34;

    // Inclusions column (left)
    if (inclusions && inclusions.length > 0) {
        pdf.setFont(serif, 'bold');
        pdf.setFontSize(10);
        pdf.setTextColor(...SLATE);
        pdf.text('Inclusions', COL_L, leftY);
        pdf.setDrawColor(...AMBER);
        pdf.setLineWidth(0.5);
        pdf.line(COL_L, leftY + 2, COL_L + 30, leftY + 2);
        leftY += 8;

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8.5);
        for (const item of inclusions) {
            if (leftY > H - M) break;
            // Green dot
            pdf.setFillColor(34, 197, 94);
            pdf.circle(COL_L + 1.8, leftY - 1.2, 1.2, 'F');
            pdf.setTextColor(...SLATE);
            const lines = pdf.splitTextToSize(item, W / 2 - M - 10);
            pdf.text(lines.slice(0, 2), COL_L + 5, leftY);
            leftY += lh(8.5) * Math.min(lines.length, 2) + 3;
        }
    }

    // Exclusions column (right)
    if (exclusions && exclusions.length > 0) {
        pdf.setFont(serif, 'bold');
        pdf.setFontSize(10);
        pdf.setTextColor(...SLATE);
        pdf.text('Exclusions', COL_R, rightY);
        pdf.setDrawColor(239, 68, 68);
        pdf.setLineWidth(0.5);
        pdf.line(COL_R, rightY + 2, COL_R + 30, rightY + 2);
        rightY += 8;

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8.5);
        for (const item of exclusions) {
            if (rightY > H - M) break;
            // Red dot
            pdf.setFillColor(239, 68, 68);
            pdf.circle(COL_R + 1.8, rightY - 1.2, 1.2, 'F');
            pdf.setTextColor(...SLATE);
            const lines = pdf.splitTextToSize(item, W / 2 - M - 10);
            pdf.text(lines.slice(0, 2), COL_R + 5, rightY);
            rightY += lh(8.5) * Math.min(lines.length, 2) + 3;
        }
    }

    drawPageFooter(pdf);
}

// ─── Terms page ───────────────────────────────────────────────────

// Parse TinyMCE HTML into structured items in document order
function parseTermsHtml(html) {
    if (!html) return [];
    const items = [];
    const doc = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html');

    function walk(node) {
        if (node.nodeType !== 1) return;
        const tag = node.tagName.toLowerCase();

        if (/^h[1-6]$/.test(tag)) {
            const text = node.textContent.replace(/\s+/g, ' ').trim();
            if (text) items.push({ type: 'heading', text });
        } else if (tag === 'p') {
            const textContent = node.textContent.replace(/\s+/g, ' ').trim();
            if (!textContent) return;
            // Paragraph whose only visible content is bold/strong → treat as heading
            const nonBold = node.innerHTML
                .replace(/<(?:strong|b)[^>]*>[\s\S]*?<\/(?:strong|b)>/gi, '')
                .replace(/<[^>]+>/g, '')
                .replace(/&nbsp;/g, ' ')
                .trim();
            if (!nonBold) {
                items.push({ type: 'heading', text: textContent });
            } else {
                const raw = node.innerHTML
                    .replace(/<br\s*\/?>/gi, '\n')
                    .replace(/<[^>]+>/g, '')
                    .replace(/&nbsp;/g, ' ')
                    .trim();
                raw.split('\n').forEach(line => {
                    const l = line.trim();
                    if (l) items.push({ type: 'paragraph', text: l });
                });
            }
        } else if (tag === 'li') {
            const raw = node.innerHTML
                .replace(/<br\s*\/?>/gi, ' ')
                .replace(/<[^>]+>/g, '')
                .replace(/&nbsp;/g, ' ')
                .trim();
            if (raw) items.push({ type: 'bullet', text: raw });
        } else {
            // ul, ol, div, section, etc. — recurse into children
            for (const child of node.children) walk(child);
        }
    }

    for (const child of doc.body.children) walk(child);

    // Decode common HTML entities
    items.forEach(item => {
        item.text = item.text
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'");
    });

    return items;
}

function drawTermsPage(pdf, terms, serif) {
    const FOOTER_H = 5;
    const maxY = H - M - FOOTER_H;

    function drawHeader() {
        pdf.setFillColor(...SLATE);
        pdf.rect(0, 0, W, 24, 'F');
        pdf.setFillColor(...AMBER);
        pdf.rect(0, 0, 3, 24, 'F');
        pdf.setFont(serif, 'bold');
        pdf.setFontSize(16);
        pdf.setTextColor(...WHITE);
        pdf.text('Terms & Conditions', M + 4, 16);
    }

    function nextPage() {
        drawPageFooter(pdf);
        pdf.addPage();
        drawHeader();
        y = 32;
    }

    drawHeader();

    const items = parseTermsHtml(terms);
    let y = 32;

    for (const item of items) {
        if (item.type === 'heading') {
            if (y + lh(9) + 5.5 > maxY) nextPage();
            y += 3;
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(9);
            pdf.setTextColor(...AMBER);
            pdf.text(item.text, M, y);
            const lineW = Math.min(pdf.getTextWidth(item.text) + 2, W - M * 2);
            pdf.setDrawColor(...AMBER);
            pdf.setLineWidth(0.25);
            pdf.line(M, y + 1.2, M + lineW, y + 1.2);
            y += lh(9) + 2.5;
        } else if (item.type === 'bullet') {
            const lines = pdf.splitTextToSize(item.text, W - M * 2 - 6);
            let first = true;
            let i = 0;
            while (i < lines.length) {
                if (y + lh(8) > maxY) nextPage();
                const avail = Math.max(1, Math.floor((maxY - y) / lh(8)));
                const chunk = lines.slice(i, i + avail);
                if (first) {
                    pdf.setFillColor(...SLATM);
                    pdf.circle(M + 1.8, y - 1.2, 0.9, 'F');
                    first = false;
                }
                pdf.setFont('helvetica', 'normal');
                pdf.setFontSize(8);
                pdf.setTextColor(...SLATM);
                pdf.text(chunk, M + 4, y);
                y += lh(8) * chunk.length;
                i += chunk.length;
            }
            y += 2.5;
        } else {
            const lines = pdf.splitTextToSize(item.text, W - M * 2);
            let i = 0;
            while (i < lines.length) {
                if (y + lh(8) > maxY) nextPage();
                const avail = Math.max(1, Math.floor((maxY - y) / lh(8)));
                const chunk = lines.slice(i, i + avail);
                pdf.setFont('helvetica', 'normal');
                pdf.setFontSize(8);
                pdf.setTextColor(...SLATM);
                pdf.text(chunk, M, y);
                y += lh(8) * chunk.length;
                i += chunk.length;
            }
            y += 3;
        }
    }

    drawPageFooter(pdf);
}

// ─── Main export ─────────────────────────────────────────────────
export async function generateItineraryPDF(data) {
    const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4', compress: true });

    pdf.setProperties({
        title: data.tripTitle || 'Travel Itinerary',
        subject: `${data.durationText || ''} — ${data.tripTitle || ''}`.trim().replace(/^—\s*/, ''),
        author: data.activeAgencyName || 'QuickTrails',
        creator: 'QuickTrails',
    });

    const serif = await loadFont(pdf);

    // Cover
    await drawCover(pdf, data, serif);

    // Days
    for (const day of (data.days || [])) {
        pdf.addPage();
        await drawDayPage(pdf, day, serif, true);
    }

    // Inclusions / Exclusions
    if ((data.inclusions?.length || data.exclusions?.length)) {
        pdf.addPage();
        drawInclusionsPage(pdf, data.inclusions || [], data.exclusions || [], serif);
    }

    // Terms
    if (data.terms && parseTermsHtml(data.terms).length > 0) {
        pdf.addPage();
        drawTermsPage(pdf, data.terms, serif);
    }

    return pdf;
}
