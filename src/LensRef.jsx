import { useState, useMemo, useCallback } from "react";

// ─── Utilities ──────────────────────────────────────────────────────────────
const esc = (s) => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");

const printTable = (title, tableHtml, subtitle = "") => {
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(`<!DOCTYPE html><html><head><title>${title} - LensRef</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #2a3a2e; padding: 24px; }
  h1 { font-size: 18px; color: #1a5c3a; margin-bottom: 4px; }
  .subtitle { font-size: 11px; color: #7a8a7e; margin-bottom: 16px; }
  table { width: 100%; border-collapse: collapse; }
  th { text-align: left; font-size: 9px; font-weight: 700; color: #5a6a5e; text-transform: uppercase;
       letter-spacing: 0.06em; padding: 6px 8px; border-bottom: 2px solid #ccc; }
  td { padding: 5px 8px; border-bottom: 1px solid #e8e8e8; font-size: 10px; }
  tr:nth-child(even) { background: #f8f8f8; }
  .badge { display: inline-block; padding: 1px 6px; border-radius: 3px; font-size: 9px; font-weight: 600; }
  .disc { color: #c9a04a; font-weight: 700; font-size: 9px; }
  .footer { margin-top: 20px; font-size: 9px; color: #999; text-align: center; }
  @media print { body { padding: 12px; } @page { margin: 0.5in; size: landscape; } }
</style></head><body>
<h1>${title}</h1>
<div class="subtitle">${subtitle || "LensRef · Printed " + new Date().toLocaleDateString()}</div>
${tableHtml}
<div class="footer">LensRef · Verify all parameters with manufacturer specifications</div>
<script>window.onafterprint=()=>window.close();window.print();<\/script>
</body></html>`);
  win.document.close();
};

// ─── Sample Data ───────────────────────────────────────────────────────────────
const LENSES = [
  { id: 1, name: "ACUVUE OASYS 1-Day", brand: "Johnson & Johnson", modality: "Daily", type: "Sphere", material: "Senofilcon A", dk: 121, bc: "8.5, 9.0", dia: "14.3", powerRange: "-12.00 to +8.00", qtyBox: 30, water: 38, wear: "Daily", replacement: "Daily", priceRange: "$35-50", privateLabel: null, discontinued: false },
  { id: 2, name: "ACUVUE OASYS MAX 1-Day", brand: "Johnson & Johnson", modality: "Daily", type: "Sphere", material: "Senofilcon A", dk: 121, bc: "8.5", dia: "14.3", powerRange: "-12.00 to +8.00", qtyBox: 30, water: 38, wear: "Daily", replacement: "Daily", priceRange: "$45-60", privateLabel: null, discontinued: false },
  { id: 3, name: "ACUVUE OASYS 2-Week", brand: "Johnson & Johnson", modality: "2-Week", type: "Sphere", material: "Senofilcon A", dk: 147, bc: "8.4, 8.8", dia: "14.0", powerRange: "-12.00 to +8.00", qtyBox: 6, water: 38, wear: "DW/EW", replacement: "2 Weeks", priceRange: "$30-45", privateLabel: null, discontinued: false },
  { id: 4, name: "ACUVUE OASYS for Astigmatism", brand: "Johnson & Johnson", modality: "2-Week", type: "Toric", material: "Senofilcon A", dk: 129, bc: "8.6", dia: "14.5", powerRange: "-9.00 to +6.00", qtyBox: 6, water: 38, wear: "DW/EW", replacement: "2 Weeks", priceRange: "$40-55", privateLabel: null, discontinued: false },
  { id: 5, name: "ACUVUE OASYS Multifocal", brand: "Johnson & Johnson", modality: "2-Week", type: "Multifocal", material: "Senofilcon A", dk: 147, bc: "8.4", dia: "14.3", powerRange: "-9.00 to +6.00", qtyBox: 6, water: 38, wear: "DW/EW", replacement: "2 Weeks", priceRange: "$45-60", privateLabel: null, discontinued: false },
  { id: 6, name: "1-DAY ACUVUE MOIST", brand: "Johnson & Johnson", modality: "Daily", type: "Sphere", material: "Etafilcon A", dk: 33.3, bc: "8.5, 9.0", dia: "14.2", powerRange: "-12.00 to +6.00", qtyBox: 30, water: 58, wear: "Daily", replacement: "Daily", priceRange: "$25-35", privateLabel: null, discontinued: false },
  { id: 7, name: "1-DAY ACUVUE MOIST for Astigmatism", brand: "Johnson & Johnson", modality: "Daily", type: "Toric", material: "Etafilcon A", dk: 33.3, bc: "8.5", dia: "14.5", powerRange: "-9.00 to +4.00", qtyBox: 30, water: 58, wear: "Daily", replacement: "Daily", priceRange: "$35-50", privateLabel: null, discontinued: false },
  { id: 8, name: "ACUVUE VITA", brand: "Johnson & Johnson", modality: "Monthly", type: "Sphere", material: "Senofilcon C", dk: 147, bc: "8.4, 8.8", dia: "14.0", powerRange: "-12.00 to +8.00", qtyBox: 6, water: 41, wear: "Daily", replacement: "Monthly", priceRange: "$40-55", privateLabel: null, discontinued: false },
  { id: 9, name: "DAILIES TOTAL1", brand: "Alcon", modality: "Daily", type: "Sphere", material: "Delefilcon A", dk: 156, bc: "8.5", dia: "14.1", powerRange: "-12.00 to +6.00", qtyBox: 30, water: 33, wear: "Daily", replacement: "Daily", priceRange: "$45-65", privateLabel: null, discontinued: false },
  { id: 10, name: "DAILIES TOTAL1 for Astigmatism", brand: "Alcon", modality: "Daily", type: "Toric", material: "Delefilcon A", dk: 156, bc: "8.6", dia: "14.5", powerRange: "-8.00 to +4.00", qtyBox: 30, water: 33, wear: "Daily", replacement: "Daily", priceRange: "$50-70", privateLabel: null, discontinued: false },
  { id: 11, name: "DAILIES TOTAL1 Multifocal", brand: "Alcon", modality: "Daily", type: "Multifocal", material: "Delefilcon A", dk: 156, bc: "8.5", dia: "14.1", powerRange: "-10.00 to +6.00", qtyBox: 30, water: 33, wear: "Daily", replacement: "Daily", priceRange: "$55-75", privateLabel: null, discontinued: false },
  { id: 12, name: "AIR OPTIX plus HydraGlyde", brand: "Alcon", modality: "Monthly", type: "Sphere", material: "Lotrafilcon B", dk: 138, bc: "8.6", dia: "14.2", powerRange: "-10.00 to +6.00", qtyBox: 6, water: 33, wear: "DW/EW", replacement: "Monthly", priceRange: "$30-45", privateLabel: "Kirkland Signature HD (Costco)", discontinued: false },
  { id: 13, name: "AIR OPTIX for Astigmatism", brand: "Alcon", modality: "Monthly", type: "Toric", material: "Lotrafilcon B", dk: 108, bc: "8.7", dia: "14.5", powerRange: "-10.00 to +6.00", qtyBox: 6, water: 33, wear: "Daily", replacement: "Monthly", priceRange: "$40-55", privateLabel: null, discontinued: false },
  { id: 14, name: "AIR OPTIX plus HydraGlyde Multifocal", brand: "Alcon", modality: "Monthly", type: "Multifocal", material: "Lotrafilcon B", dk: 138, bc: "8.6", dia: "14.2", powerRange: "-10.00 to +6.00", qtyBox: 6, water: 33, wear: "Daily", replacement: "Monthly", priceRange: "$45-60", privateLabel: null, discontinued: false },
  { id: 15, name: "PRECISION1", brand: "Alcon", modality: "Daily", type: "Sphere", material: "Verofilcon A", dk: 90, bc: "8.3", dia: "14.2", powerRange: "-12.00 to +8.00", qtyBox: 30, water: 51, wear: "Daily", replacement: "Daily", priceRange: "$30-40", privateLabel: null, discontinued: false },
  { id: 16, name: "PRECISION1 for Astigmatism", brand: "Alcon", modality: "Daily", type: "Toric", material: "Verofilcon A", dk: 90, bc: "8.5", dia: "14.5", powerRange: "-8.00 to +4.00", qtyBox: 30, water: 51, wear: "Daily", replacement: "Daily", priceRange: "$35-50", privateLabel: null, discontinued: false },
  { id: 17, name: "Biofinity", brand: "CooperVision", modality: "Monthly", type: "Sphere", material: "Comfilcon A", dk: 160, bc: "8.6", dia: "14.0", powerRange: "-12.00 to +8.00", qtyBox: 6, water: 48, wear: "DW/EW", replacement: "Monthly", priceRange: "$30-45", privateLabel: "Kirkland Signature (Costco)", discontinued: false },
  { id: 18, name: "Biofinity Toric", brand: "CooperVision", modality: "Monthly", type: "Toric", material: "Comfilcon A", dk: 160, bc: "8.7", dia: "14.5", powerRange: "-10.00 to +10.00", qtyBox: 6, water: 48, wear: "DW/EW", replacement: "Monthly", priceRange: "$40-55", privateLabel: null, discontinued: false },
  { id: 19, name: "Biofinity Multifocal", brand: "CooperVision", modality: "Monthly", type: "Multifocal", material: "Comfilcon A", dk: 160, bc: "8.6", dia: "14.0", powerRange: "-10.00 to +10.00", qtyBox: 6, water: 48, wear: "DW/EW", replacement: "Monthly", priceRange: "$50-65", privateLabel: null, discontinued: false },
  { id: 20, name: "clariti 1 day", brand: "CooperVision", modality: "Daily", type: "Sphere", material: "Somofilcon A", dk: 86, bc: "8.6", dia: "14.1", powerRange: "-10.00 to +8.00", qtyBox: 30, water: 56, wear: "Daily", replacement: "Daily", priceRange: "$25-35", privateLabel: "Walmart Equate 1-Day", discontinued: false },
  { id: 21, name: "clariti 1 day toric", brand: "CooperVision", modality: "Daily", type: "Toric", material: "Somofilcon A", dk: 86, bc: "8.6", dia: "14.3", powerRange: "-9.00 to +4.00", qtyBox: 30, water: 56, wear: "Daily", replacement: "Daily", priceRange: "$35-45", privateLabel: null, discontinued: false },
  { id: 22, name: "clariti 1 day multifocal", brand: "CooperVision", modality: "Daily", type: "Multifocal", material: "Somofilcon A", dk: 86, bc: "8.6", dia: "14.1", powerRange: "-6.00 to +5.00", qtyBox: 30, water: 56, wear: "Daily", replacement: "Daily", priceRange: "$35-50", privateLabel: null, discontinued: false },
  { id: 23, name: "MyDay", brand: "CooperVision", modality: "Daily", type: "Sphere", material: "Stenfilcon A", dk: 100, bc: "8.4", dia: "14.2", powerRange: "-12.00 to +8.00", qtyBox: 30, water: 54, wear: "Daily", replacement: "Daily", priceRange: "$35-50", privateLabel: null, discontinued: false },
  { id: 24, name: "MyDay Toric", brand: "CooperVision", modality: "Daily", type: "Toric", material: "Stenfilcon A", dk: 100, bc: "8.6", dia: "14.5", powerRange: "-9.00 to +4.00", qtyBox: 30, water: 54, wear: "Daily", replacement: "Daily", priceRange: "$40-55", privateLabel: null, discontinued: false },
  { id: 25, name: "MyDay Multifocal", brand: "CooperVision", modality: "Daily", type: "Multifocal", material: "Stenfilcon A", dk: 100, bc: "8.4", dia: "14.2", powerRange: "-10.00 to +6.00", qtyBox: 30, water: 54, wear: "Daily", replacement: "Daily", priceRange: "$45-60", privateLabel: null, discontinued: false },
  { id: 26, name: "Biotrue ONEday", brand: "Bausch + Lomb", modality: "Daily", type: "Sphere", material: "Nesofilcon A", dk: 42, bc: "8.6", dia: "14.2", powerRange: "-12.00 to +6.00", qtyBox: 30, water: 78, wear: "Daily", replacement: "Daily", priceRange: "$25-35", privateLabel: null, discontinued: false },
  { id: 27, name: "Biotrue ONEday for Astigmatism", brand: "Bausch + Lomb", modality: "Daily", type: "Toric", material: "Nesofilcon A", dk: 42, bc: "8.4", dia: "14.5", powerRange: "-9.00 to +4.00", qtyBox: 30, water: 78, wear: "Daily", replacement: "Daily", priceRange: "$35-50", privateLabel: null, discontinued: false },
  { id: 28, name: "Biotrue ONEday for Presbyopia", brand: "Bausch + Lomb", modality: "Daily", type: "Multifocal", material: "Nesofilcon A", dk: 42, bc: "8.6", dia: "14.2", powerRange: "-9.00 to +6.00", qtyBox: 30, water: 78, wear: "Daily", replacement: "Daily", priceRange: "$40-55", privateLabel: null, discontinued: false },
  { id: 29, name: "ULTRA", brand: "Bausch + Lomb", modality: "Monthly", type: "Sphere", material: "Samfilcon A", dk: 114, bc: "8.5", dia: "14.2", powerRange: "-12.00 to +6.00", qtyBox: 6, water: 46, wear: "Daily", replacement: "Monthly", priceRange: "$35-50", privateLabel: null, discontinued: false },
  { id: 30, name: "ULTRA for Astigmatism", brand: "Bausch + Lomb", modality: "Monthly", type: "Toric", material: "Samfilcon A", dk: 114, bc: "8.6", dia: "14.5", powerRange: "-9.00 to +6.00", qtyBox: 6, water: 46, wear: "Daily", replacement: "Monthly", priceRange: "$45-60", privateLabel: null, discontinued: false },
  { id: 31, name: "ULTRA for Presbyopia", brand: "Bausch + Lomb", modality: "Monthly", type: "Multifocal", material: "Samfilcon A", dk: 114, bc: "8.5", dia: "14.2", powerRange: "-10.00 to +6.00", qtyBox: 6, water: 46, wear: "Daily", replacement: "Monthly", priceRange: "$50-65", privateLabel: null, discontinued: false },
  { id: 32, name: "INFUSE One-Day", brand: "Bausch + Lomb", modality: "Daily", type: "Sphere", material: "Kalifilcon A", dk: 119, bc: "8.6", dia: "14.2", powerRange: "-12.00 to +8.00", qtyBox: 30, water: 55, wear: "Daily", replacement: "Daily", priceRange: "$35-50", privateLabel: null, discontinued: false },
  { id: 33, name: "INFUSE for Astigmatism", brand: "Bausch + Lomb", modality: "Daily", type: "Toric", material: "Kalifilcon A", dk: 119, bc: "8.6", dia: "14.5", powerRange: "-9.00 to +4.00", qtyBox: 30, water: 55, wear: "Daily", replacement: "Daily", priceRange: "$40-55", privateLabel: null, discontinued: false },
  { id: 34, name: "INFUSE Multifocal", brand: "Bausch + Lomb", modality: "Daily", type: "Multifocal", material: "Kalifilcon A", dk: 119, bc: "8.6", dia: "14.2", powerRange: "-9.00 to +6.00", qtyBox: 30, water: 55, wear: "Daily", replacement: "Daily", priceRange: "$45-60", privateLabel: null, discontinued: false },
  { id: 35, name: "SofLens Daily Disposable", brand: "Bausch + Lomb", modality: "Daily", type: "Sphere", material: "Hilafilcon B", dk: 24, bc: "8.6", dia: "14.2", powerRange: "-9.00 to +6.50", qtyBox: 30, water: 59, wear: "Daily", replacement: "Daily", priceRange: "$18-25", privateLabel: null, discontinued: false },
  { id: 36, name: "PureVision 2", brand: "Bausch + Lomb", modality: "Monthly", type: "Sphere", material: "Balafilcon A", dk: 130, bc: "8.6", dia: "14.0", powerRange: "-12.00 to +6.00", qtyBox: 6, water: 36, wear: "DW/EW", replacement: "Monthly", priceRange: "$25-35", privateLabel: null, discontinued: false },
  { id: 37, name: "Kirkland Signature HD", brand: "Costco (Private Label)", modality: "Monthly", type: "Sphere", material: "Lotrafilcon B", dk: 138, bc: "8.6", dia: "14.2", powerRange: "-10.00 to +6.00", qtyBox: 6, water: 33, wear: "DW/EW", replacement: "Monthly", priceRange: "$18-22", privateLabel: "= AIR OPTIX plus HydraGlyde (Alcon)", discontinued: false },
  { id: 38, name: "Kirkland Signature", brand: "Costco (Private Label)", modality: "Monthly", type: "Sphere", material: "Comfilcon A", dk: 160, bc: "8.6", dia: "14.0", powerRange: "-12.00 to +8.00", qtyBox: 6, water: 48, wear: "DW/EW", replacement: "Monthly", priceRange: "$16-20", privateLabel: "= Biofinity (CooperVision)", discontinued: false },
  { id: 39, name: "Equate 1-Day", brand: "Walmart (Private Label)", modality: "Daily", type: "Sphere", material: "Somofilcon A", dk: 86, bc: "8.6", dia: "14.1", powerRange: "-10.00 to +8.00", qtyBox: 30, water: 56, wear: "Daily", replacement: "Daily", priceRange: "$15-20", privateLabel: "= clariti 1 day (CooperVision)", discontinued: false },
  { id: 40, name: "ACUVUE 2", brand: "Johnson & Johnson", modality: "2-Week", type: "Sphere", material: "Etafilcon A", dk: 33.3, bc: "8.3, 8.7", dia: "14.0", powerRange: "-12.00 to +8.00", qtyBox: 6, water: 58, wear: "DW/EW", replacement: "2 Weeks", priceRange: "$20-30", privateLabel: null, discontinued: true },
];

const PRIVATE_LABEL_MAP = [
  { original: "AIR OPTIX plus HydraGlyde", originalBrand: "Alcon", privateLabel: "Kirkland Signature HD", plBrand: "Costco", material: "Lotrafilcon B", confirmed: true },
  { original: "Biofinity", originalBrand: "CooperVision", privateLabel: "Kirkland Signature", plBrand: "Costco", material: "Comfilcon A", confirmed: true },
  { original: "clariti 1 day", originalBrand: "CooperVision", privateLabel: "Equate 1-Day", plBrand: "Walmart", material: "Somofilcon A", confirmed: true },
  { original: "MyDay", originalBrand: "CooperVision", privateLabel: "Waldo Daily", plBrand: "Waldo", material: "Stenfilcon A", confirmed: false },
  { original: "DAILIES TOTAL1", originalBrand: "Alcon", privateLabel: "Hubble (Classic)", plBrand: "Hubble", material: "Methafilcon A", confirmed: false },
  { original: "Biofinity Toric", originalBrand: "CooperVision", privateLabel: "Kirkland Signature for Astigmatism", plBrand: "Costco", material: "Comfilcon A", confirmed: true },
];

const MEDS = [
  { name: "Prednisolone Acetate 1%", class: "Corticosteroid", brand: "Pred Forte", dosage: "1 drop 2-4x daily", indication: "Inflammation", contraindications: "Viral/fungal infection", priceRange: "$$$" },
  { name: "Loteprednol 0.5%", class: "Corticosteroid", brand: "Lotemax", dosage: "1 drop 4x daily", indication: "Inflammation", contraindications: "Viral/fungal infection", priceRange: "$$$" },
  { name: "Moxifloxacin 0.5%", class: "Fluoroquinolone", brand: "Vigamox", dosage: "1 drop 3x daily", indication: "Bacterial infection", contraindications: "Hypersensitivity", priceRange: "$$" },
  { name: "Ofloxacin 0.3%", class: "Fluoroquinolone", brand: "Ocuflox", dosage: "1-2 drops q2-4h", indication: "Bacterial infection", contraindications: "Hypersensitivity", priceRange: "$" },
  { name: "Tobramycin 0.3%", class: "Aminoglycoside", brand: "Tobrex", dosage: "1-2 drops q4h", indication: "Bacterial infection", contraindications: "Hypersensitivity", priceRange: "$" },
  { name: "Erythromycin 0.5% ointment", class: "Macrolide", brand: "Ilotycin", dosage: "Apply 1-2x daily", indication: "Bacterial infection / prophylaxis", contraindications: "Hypersensitivity", priceRange: "$" },
  { name: "Timolol 0.5%", class: "Beta-blocker", brand: "Timoptic", dosage: "1 drop BID", indication: "Glaucoma / OHT", contraindications: "Asthma, COPD, bradycardia", priceRange: "$" },
  { name: "Latanoprost 0.005%", class: "Prostaglandin analog", brand: "Xalatan", dosage: "1 drop QHS", indication: "Glaucoma / OHT", contraindications: "Active intraocular inflammation", priceRange: "$$" },
  { name: "Brimonidine 0.2%", class: "Alpha-2 agonist", brand: "Alphagan P", dosage: "1 drop TID", indication: "Glaucoma / OHT", contraindications: "MAO inhibitor use, children <2", priceRange: "$$" },
  { name: "Dorzolamide 2%", class: "CAI", brand: "Trusopt", dosage: "1 drop TID", indication: "Glaucoma / OHT", contraindications: "Sulfa allergy (caution)", priceRange: "$$" },
  { name: "Cyclopentolate 1%", class: "Cycloplegic", brand: "Cyclogyl", dosage: "1 drop, repeat x1 in 5 min", indication: "Cycloplegic refraction", contraindications: "Narrow angle, children (caution)", priceRange: "$" },
  { name: "Tropicamide 1%", class: "Mydriatic", brand: "Mydriacyl", dosage: "1 drop, repeat in 5 min", indication: "Dilation", contraindications: "Narrow angle", priceRange: "$" },
  { name: "Phenylephrine 2.5%", class: "Mydriatic", brand: "Mydfrin", dosage: "1 drop", indication: "Dilation (adjunct)", contraindications: "Narrow angle, severe HTN", priceRange: "$" },
  { name: "Ketorolac 0.5%", class: "NSAID", brand: "Acular", dosage: "1 drop QID", indication: "Pain/inflammation post-op", contraindications: "NSAID sensitivity", priceRange: "$$" },
  { name: "Artificial Tears (CMC)", class: "Lubricant", brand: "Refresh Tears", dosage: "1-2 drops PRN", indication: "Dry eye", contraindications: "None significant", priceRange: "$" },
  { name: "Cyclosporine 0.05%", class: "Immunomodulator", brand: "Restasis", dosage: "1 drop BID", indication: "Chronic dry eye", contraindications: "Active eye infection", priceRange: "$$$" },
  { name: "Lifitegrast 5%", class: "LFA-1 antagonist", brand: "Xiidra", dosage: "1 drop BID", indication: "Dry eye disease", contraindications: "Hypersensitivity", priceRange: "$$$" },
];

// ─── Helper Components ─────────────────────────────────────────────────────────

const SortIcon = ({ active, direction }) => (
  <span style={{ marginLeft: 4, opacity: active ? 1 : 0.25, fontSize: 10, transition: "opacity 0.15s" }}>
    {active && direction === "desc" ? "▼" : "▲"}
  </span>
);

const FilterPill = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    style={{
      padding: "5px 14px",
      borderRadius: 20,
      border: active ? "1.5px solid #1a5c3a" : "1.5px solid #d0d5d0",
      background: active ? "#1a5c3a" : "#fff",
      color: active ? "#fff" : "#3a4a3e",
      fontSize: 12,
      fontFamily: "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace",
      fontWeight: active ? 600 : 400,
      cursor: "pointer",
      transition: "all 0.15s ease",
      letterSpacing: "0.02em",
      whiteSpace: "nowrap",
    }}
  >
    {label}
  </button>
);

const Badge = ({ children, color = "#1a5c3a" }) => (
  <span style={{
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: 4,
    background: color + "15",
    color: color,
    fontSize: 11,
    fontWeight: 600,
    fontFamily: "'JetBrains Mono', monospace",
    letterSpacing: "0.02em",
  }}>
    {children}
  </span>
);

const PrintButton = ({ onClick, label = "Print Table" }) => (
  <button
    onClick={onClick}
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      padding: "7px 16px",
      borderRadius: 6,
      border: "1.5px solid #1a5c3a",
      background: "#fff",
      color: "#1a5c3a",
      fontSize: 12,
      fontWeight: 600,
      fontFamily: "'JetBrains Mono', monospace",
      cursor: "pointer",
      transition: "all 0.15s",
      letterSpacing: "0.02em",
    }}
    onMouseEnter={(e) => { e.currentTarget.style.background = "#1a5c3a"; e.currentTarget.style.color = "#fff"; }}
    onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#1a5c3a"; }}
  >
    <span style={{ fontSize: 14 }}>🖨</span> {label}
  </button>
);

// ─── Main App ──────────────────────────────────────────────────────────────────

export default function LensRef() {
  const [activeTab, setActiveTab] = useState("lenses");
  const [searchQuery, setSearchQuery] = useState("");
  const [brandFilter, setBrandFilter] = useState("All");
  const [modalityFilter, setModalityFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [showDiscontinued, setShowDiscontinued] = useState(false);
  const [sortCol, setSortCol] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [selectedLens, setSelectedLens] = useState(null);
  const [medSearch, setMedSearch] = useState("");
  const [medSortCol, setMedSortCol] = useState("name");
  const [medSortDir, setMedSortDir] = useState("asc");
  const [plSearch, setPlSearch] = useState("");

  // ─── Filtered Data ─────────────────────────────────────────────────────────
  const brands = useMemo(() => ["All", ...new Set(LENSES.map(l => l.brand))], []);
  const modalities = ["All", "Daily", "2-Week", "Monthly"];
  const types = ["All", "Sphere", "Toric", "Multifocal"];

  const filteredLenses = useMemo(() => {
    let result = LENSES.filter(l => {
      if (!showDiscontinued && l.discontinued) return false;
      if (brandFilter !== "All" && l.brand !== brandFilter) return false;
      if (modalityFilter !== "All" && l.modality !== modalityFilter) return false;
      if (typeFilter !== "All" && l.type !== typeFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return l.name.toLowerCase().includes(q) || l.brand.toLowerCase().includes(q) || l.material.toLowerCase().includes(q);
      }
      return true;
    });
    result.sort((a, b) => {
      let aVal = a[sortCol], bVal = b[sortCol];
      if (typeof aVal === "string") aVal = aVal.toLowerCase();
      if (typeof bVal === "string") bVal = bVal.toLowerCase();
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return result;
  }, [searchQuery, brandFilter, modalityFilter, typeFilter, showDiscontinued, sortCol, sortDir]);

  const filteredMeds = useMemo(() => {
    let result = MEDS.filter(m => {
      if (medSearch) {
        const q = medSearch.toLowerCase();
        return m.name.toLowerCase().includes(q) || m.brand.toLowerCase().includes(q) || m.class.toLowerCase().includes(q) || m.indication.toLowerCase().includes(q);
      }
      return true;
    });
    result.sort((a, b) => {
      let aVal = a[medSortCol], bVal = b[medSortCol];
      if (typeof aVal === "string") aVal = aVal.toLowerCase();
      if (typeof bVal === "string") bVal = bVal.toLowerCase();
      if (aVal < bVal) return medSortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return medSortDir === "asc" ? 1 : -1;
      return 0;
    });
    return result;
  }, [medSearch, medSortCol, medSortDir]);

  const filteredPL = useMemo(() => {
    if (!plSearch) return PRIVATE_LABEL_MAP;
    const q = plSearch.toLowerCase();
    return PRIVATE_LABEL_MAP.filter(p =>
      p.original.toLowerCase().includes(q) || p.privateLabel.toLowerCase().includes(q) ||
      p.originalBrand.toLowerCase().includes(q) || p.plBrand.toLowerCase().includes(q)
    );
  }, [plSearch]);

  // ─── Sort & Print Handlers ────────────────────────────────────────────────
  const handleSort = useCallback((col) => {
    setSortDir(prev => sortCol === col ? (prev === "asc" ? "desc" : "asc") : "asc");
    setSortCol(col);
  }, [sortCol]);

  const handleMedSort = useCallback((col) => {
    setMedSortDir(prev => medSortCol === col ? (prev === "asc" ? "desc" : "asc") : "asc");
    setMedSortCol(col);
  }, [medSortCol]);

  const printLenses = useCallback(() => {
    const rows = filteredLenses.map(l =>
      `<tr><td style="font-weight:600;color:${l.discontinued ? '#999' : '#1a5c3a'}">${l.name}${l.discontinued ? ' <span class="disc">DISC</span>' : ''}</td>` +
      `<td>${l.brand}</td><td>${l.modality}</td><td>${l.type}</td><td>${l.material}</td>` +
      `<td>${l.dk}</td><td>${l.bc}</td><td>${l.dia}</td><td>${l.water}%</td>` +
      `<td>${l.powerRange}</td><td>${l.qtyBox}</td><td>${l.replacement}</td><td>${l.priceRange}</td></tr>`
    ).join("");
    const filters = [
      brandFilter !== "All" ? brandFilter : null,
      modalityFilter !== "All" ? modalityFilter : null,
      typeFilter !== "All" ? typeFilter : null,
      searchQuery ? `"${esc(searchQuery)}"` : null,
    ].filter(Boolean);
    const subtitle = filters.length
      ? `Filtered: ${filters.join(" · ")} · ${filteredLenses.length} lenses · LensRef · ${new Date().toLocaleDateString()}`
      : `${filteredLenses.length} lenses · LensRef · ${new Date().toLocaleDateString()}`;
    printTable("Contact Lens Parameters",
      `<table><thead><tr><th>Lens Name</th><th>Brand</th><th>Modality</th><th>Type</th><th>Material</th>` +
      `<th>Dk</th><th>BC</th><th>Dia</th><th>H₂O%</th><th>Power Range</th><th>Qty</th><th>Replace</th><th>Price</th></tr></thead>` +
      `<tbody>${rows}</tbody></table>`, subtitle);
  }, [filteredLenses, brandFilter, modalityFilter, typeFilter, searchQuery]);

  const printCrossRef = useCallback(() => {
    const rows = filteredPL.map(p =>
      `<tr><td style="font-weight:600;color:#1a5c3a">${p.original}</td><td>${p.originalBrand}</td>` +
      `<td style="text-align:center">⇄</td>` +
      `<td style="font-weight:600;color:#5a3a8a">${p.privateLabel}</td><td>${p.plBrand}</td>` +
      `<td>${p.material}</td><td>${p.confirmed ? '✓ Confirmed' : 'Unverified'}</td></tr>`
    ).join("");
    printTable("Private Label Cross-Reference",
      `<table><thead><tr><th>Name Brand</th><th>Mfg</th><th>↔</th><th>Private Label</th><th>Retailer</th><th>Material</th><th>Status</th></tr></thead>` +
      `<tbody>${rows}</tbody></table>`,
      `${filteredPL.length} cross-references · LensRef · ${new Date().toLocaleDateString()}`);
  }, [filteredPL]);

  const printMeds = useCallback(() => {
    const rows = filteredMeds.map(m =>
      `<tr><td style="font-weight:600;color:#1a5c3a">${m.name}</td><td>${m.class}</td><td>${m.brand}</td>` +
      `<td>${m.dosage}</td><td>${m.indication}</td><td style="color:#8a4a2a">${m.contraindications}</td><td>${m.priceRange}</td></tr>`
    ).join("");
    printTable("Ocular Medications Reference",
      `<table><thead><tr><th>Medication</th><th>Class</th><th>Brand</th><th>Dosage</th><th>Indication</th><th>Contraindications</th><th>Price</th></tr></thead>` +
      `<tbody>${rows}</tbody></table>`,
      `${filteredMeds.length} medications · LensRef · ${new Date().toLocaleDateString()}`);
  }, [filteredMeds]);

  const tabStyle = (tab) => ({
    padding: "10px 24px",
    border: "none",
    borderBottom: activeTab === tab ? "2.5px solid #1a5c3a" : "2.5px solid transparent",
    background: "transparent",
    color: activeTab === tab ? "#1a5c3a" : "#7a8a7e",
    fontWeight: activeTab === tab ? 700 : 500,
    fontSize: 14,
    cursor: "pointer",
    fontFamily: "'JetBrains Mono', monospace",
    letterSpacing: "0.03em",
    transition: "all 0.15s",
  });

  const thStyle = (col, currentSort) => ({
    padding: "10px 12px",
    textAlign: "left",
    fontSize: 11,
    fontWeight: 700,
    color: "#5a6a5e",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    cursor: "pointer",
    userSelect: "none",
    borderBottom: "2px solid #e8ece8",
    background: currentSort === col ? "#f0f4f0" : "transparent",
    transition: "background 0.1s",
    whiteSpace: "nowrap",
    fontFamily: "'JetBrains Mono', monospace",
    position: "sticky",
    top: 0,
    zIndex: 2,
  });

  const tdStyle = {
    padding: "9px 12px",
    fontSize: 13,
    borderBottom: "1px solid #eef1ee",
    fontFamily: "'JetBrains Mono', monospace",
    color: "#2a3a2e",
    whiteSpace: "nowrap",
  };

  const countBadge = (count) => (
    <span style={{
      display: "inline-block",
      marginLeft: 6,
      padding: "1px 7px",
      borderRadius: 10,
      background: "#e8ece8",
      color: "#5a6a5e",
      fontSize: 11,
      fontWeight: 600,
      fontFamily: "'JetBrains Mono', monospace",
    }}>
      {count}
    </span>
  );

  return (
    <div style={{
      fontFamily: "'JetBrains Mono', 'SF Mono', 'Fira Code', Consolas, monospace",
      background: "#f7f9f7",
      minHeight: "100vh",
      color: "#2a3a2e",
    }}>
      {/* Header */}
      <div style={{
        background: "#1a5c3a",
        padding: "20px 28px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <span style={{
            fontSize: 22,
            fontWeight: 800,
            color: "#fff",
            letterSpacing: "-0.02em",
          }}>
            LensRef
          </span>
          <span style={{
            fontSize: 11,
            color: "#8abf9e",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontWeight: 500,
          }}>
            Contact Lens Reference
          </span>
        </div>
        <span style={{ fontSize: 11, color: "#8abf9e", letterSpacing: "0.04em" }}>
          PROTOTYPE · {LENSES.filter(l => !l.discontinued).length} active lenses
        </span>
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex",
        gap: 0,
        background: "#fff",
        borderBottom: "1px solid #e2e6e2",
        paddingLeft: 16,
      }}>
        <button style={tabStyle("lenses")} onClick={() => setActiveTab("lenses")}>
          Lenses {countBadge(filteredLenses.length)}
        </button>
        <button style={tabStyle("crossref")} onClick={() => setActiveTab("crossref")}>
          Private Label ↔
        </button>
        <button style={tabStyle("meds")} onClick={() => setActiveTab("meds")}>
          Meds
        </button>
      </div>

      {/* ── LENSES TAB ── */}
      {activeTab === "lenses" && (
        <div style={{ padding: "16px 20px" }}>
          {/* Search */}
          <input
            type="text"
            placeholder="Search lenses, brands, materials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              maxWidth: 480,
              padding: "10px 14px",
              border: "1.5px solid #d0d5d0",
              borderRadius: 8,
              fontSize: 13,
              fontFamily: "'JetBrains Mono', monospace",
              background: "#fff",
              outline: "none",
              marginBottom: 12,
              boxSizing: "border-box",
              transition: "border-color 0.15s",
            }}
            onFocus={(e) => e.target.style.borderColor = "#1a5c3a"}
            onBlur={(e) => e.target.style.borderColor = "#d0d5d0"}
          />

          {/* Filters */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8, alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#7a8a7e", textTransform: "uppercase", letterSpacing: "0.06em", marginRight: 4 }}>Brand</span>
            {brands.map(b => (
              <FilterPill key={b} label={b === "All" ? "All Brands" : b} active={brandFilter === b} onClick={() => setBrandFilter(b)} />
            ))}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8, alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#7a8a7e", textTransform: "uppercase", letterSpacing: "0.06em", marginRight: 4 }}>Modality</span>
            {modalities.map(m => (
              <FilterPill key={m} label={m === "All" ? "All" : m} active={modalityFilter === m} onClick={() => setModalityFilter(m)} />
            ))}
            <span style={{ width: 16 }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: "#7a8a7e", textTransform: "uppercase", letterSpacing: "0.06em", marginRight: 4 }}>Type</span>
            {types.map(t => (
              <FilterPill key={t} label={t === "All" ? "All" : t} active={typeFilter === t} onClick={() => setTypeFilter(t)} />
            ))}
          </div>
          <div style={{ marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <label style={{ fontSize: 12, color: "#7a8a7e", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              <input type="checkbox" checked={showDiscontinued} onChange={() => setShowDiscontinued(!showDiscontinued)} style={{ accentColor: "#1a5c3a" }} />
              Show discontinued
            </label>
            <PrintButton onClick={printLenses} label={`Print ${filteredLenses.length} Lenses`} />
          </div>

          {/* Table */}
          <div style={{ overflowX: "auto", background: "#fff", borderRadius: 8, border: "1px solid #e2e6e2" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1000 }}>
              <thead>
                <tr style={{ background: "#fafcfa" }}>
                  {[
                    ["name", "Lens Name"],
                    ["brand", "Brand"],
                    ["modality", "Modality"],
                    ["type", "Type"],
                    ["material", "Material"],
                    ["dk", "Dk"],
                    ["bc", "BC"],
                    ["dia", "Dia"],
                    ["water", "H₂O %"],
                    ["powerRange", "Power Range"],
                    ["qtyBox", "Qty"],
                    ["replacement", "Replace"],
                    ["priceRange", "Price"],
                  ].map(([col, label]) => (
                    <th key={col} style={thStyle(col, sortCol)} onClick={() => handleSort(col)}>
                      {label}
                      <SortIcon active={sortCol === col} direction={sortDir} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredLenses.map((l) => (
                  <tr
                    key={l.id}
                    onClick={() => setSelectedLens(selectedLens?.id === l.id ? null : l)}
                    style={{
                      cursor: "pointer",
                      background: selectedLens?.id === l.id ? "#f0f7f2" : l.discontinued ? "#faf8f5" : "transparent",
                      transition: "background 0.1s",
                    }}
                    onMouseEnter={(e) => { if (selectedLens?.id !== l.id) e.currentTarget.style.background = "#f5f8f5"; }}
                    onMouseLeave={(e) => { if (selectedLens?.id !== l.id) e.currentTarget.style.background = l.discontinued ? "#faf8f5" : "transparent"; }}
                  >
                    <td style={{ ...tdStyle, fontWeight: 600, color: l.discontinued ? "#999" : "#1a5c3a" }}>
                      {l.name}
                      {l.discontinued && <span style={{ marginLeft: 6, fontSize: 10, color: "#c9a04a", fontWeight: 700 }}>DISC</span>}
                      {l.privateLabel && <span style={{ marginLeft: 6, fontSize: 10 }}>🔗</span>}
                    </td>
                    <td style={tdStyle}>{l.brand}</td>
                    <td style={tdStyle}><Badge>{l.modality}</Badge></td>
                    <td style={tdStyle}><Badge color={l.type === "Toric" ? "#5a3a8a" : l.type === "Multifocal" ? "#8a5a1a" : "#1a5c3a"}>{l.type}</Badge></td>
                    <td style={{ ...tdStyle, fontSize: 12 }}>{l.material}</td>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>{l.dk}</td>
                    <td style={tdStyle}>{l.bc}</td>
                    <td style={tdStyle}>{l.dia}</td>
                    <td style={tdStyle}>{l.water}%</td>
                    <td style={{ ...tdStyle, fontSize: 11 }}>{l.powerRange}</td>
                    <td style={{ ...tdStyle, textAlign: "center" }}>{l.qtyBox}</td>
                    <td style={tdStyle}>{l.replacement}</td>
                    <td style={{ ...tdStyle, color: "#5a6a5e" }}>{l.priceRange}</td>
                  </tr>
                ))}
                {filteredLenses.length === 0 && (
                  <tr><td colSpan={13} style={{ ...tdStyle, textAlign: "center", color: "#999", padding: 32 }}>No lenses match your filters</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Detail Panel */}
          {selectedLens && (
            <div style={{
              marginTop: 16,
              padding: 20,
              background: "#fff",
              borderRadius: 8,
              border: "1.5px solid #1a5c3a30",
              maxWidth: 700,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, color: "#1a5c3a", fontWeight: 700 }}>{selectedLens.name}</h3>
                  <span style={{ fontSize: 12, color: "#7a8a7e" }}>{selectedLens.brand} · {selectedLens.material}</span>
                </div>
                <button onClick={() => setSelectedLens(null)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#999" }}>✕</button>
              </div>
              <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px 20px", fontSize: 12 }}>
                {[
                  ["Dk/t", selectedLens.dk],
                  ["Base Curve", selectedLens.bc],
                  ["Diameter", selectedLens.dia],
                  ["Water Content", selectedLens.water + "%"],
                  ["Power Range", selectedLens.powerRange],
                  ["Qty/Box", selectedLens.qtyBox],
                  ["Wear", selectedLens.wear],
                  ["Replacement", selectedLens.replacement],
                  ["Price Range", selectedLens.priceRange],
                ].map(([label, val]) => (
                  <div key={label}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#7a8a7e", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>{label}</div>
                    <div style={{ fontWeight: 600, color: "#2a3a2e" }}>{val}</div>
                  </div>
                ))}
              </div>
              {selectedLens.privateLabel && (
                <div style={{ marginTop: 14, padding: "10px 14px", background: "#f0f7f2", borderRadius: 6, fontSize: 12 }}>
                  <span style={{ fontWeight: 700, color: "#1a5c3a" }}>🔗 Private Label:</span>{" "}
                  <span style={{ color: "#2a3a2e" }}>{selectedLens.privateLabel}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── PRIVATE LABEL CROSS-REF TAB ── */}
      {activeTab === "crossref" && (
        <div style={{ padding: "16px 20px" }}>
          <p style={{ fontSize: 13, color: "#5a6a5e", marginTop: 0, marginBottom: 14, lineHeight: 1.5, maxWidth: 600 }}>
            Many store-brand lenses are manufactured identically to name-brand lenses — same mold, same material, lower price. Look up equivalents here.
          </p>
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 14 }}>
            <input
              type="text"
              placeholder="Search by lens name or retailer..."
              value={plSearch}
              onChange={(e) => setPlSearch(e.target.value)}
              style={{
                width: "100%",
                maxWidth: 400,
                padding: "10px 14px",
                border: "1.5px solid #d0d5d0",
                borderRadius: 8,
                fontSize: 13,
                fontFamily: "'JetBrains Mono', monospace",
                background: "#fff",
                outline: "none",
                boxSizing: "border-box",
              }}
              onFocus={(e) => e.target.style.borderColor = "#1a5c3a"}
              onBlur={(e) => e.target.style.borderColor = "#d0d5d0"}
            />
            <PrintButton onClick={printCrossRef} label="Print Cross-Ref" />
          </div>
          <div style={{ overflowX: "auto", background: "#fff", borderRadius: 8, border: "1px solid #e2e6e2" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
              <thead>
                <tr style={{ background: "#fafcfa" }}>
                  <th style={{ ...thStyle("", ""), cursor: "default" }}>Name Brand</th>
                  <th style={{ ...thStyle("", ""), cursor: "default" }}>Mfg</th>
                  <th style={{ ...thStyle("", ""), cursor: "default", textAlign: "center" }}>↔</th>
                  <th style={{ ...thStyle("", ""), cursor: "default" }}>Private Label</th>
                  <th style={{ ...thStyle("", ""), cursor: "default" }}>Retailer</th>
                  <th style={{ ...thStyle("", ""), cursor: "default" }}>Material</th>
                  <th style={{ ...thStyle("", ""), cursor: "default" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredPL.map((p, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#fafcfa" }}>
                    <td style={{ ...tdStyle, fontWeight: 600, color: "#1a5c3a" }}>{p.original}</td>
                    <td style={tdStyle}>{p.originalBrand}</td>
                    <td style={{ ...tdStyle, textAlign: "center", fontSize: 16, color: "#1a5c3a" }}>⇄</td>
                    <td style={{ ...tdStyle, fontWeight: 600, color: "#5a3a8a" }}>{p.privateLabel}</td>
                    <td style={tdStyle}>{p.plBrand}</td>
                    <td style={{ ...tdStyle, fontSize: 12 }}>{p.material}</td>
                    <td style={tdStyle}>
                      <Badge color={p.confirmed ? "#1a5c3a" : "#c9a04a"}>
                        {p.confirmed ? "✓ Confirmed" : "Unverified"}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {filteredPL.length === 0 && (
                  <tr><td colSpan={7} style={{ ...tdStyle, textAlign: "center", color: "#999", padding: 32 }}>No matches found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── MEDS TAB ── */}
      {activeTab === "meds" && (
        <div style={{ padding: "16px 20px" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 14 }}>
            <input
              type="text"
              placeholder="Search medications, classes, brands..."
              value={medSearch}
              onChange={(e) => setMedSearch(e.target.value)}
              style={{
                width: "100%",
                maxWidth: 400,
                padding: "10px 14px",
                border: "1.5px solid #d0d5d0",
                borderRadius: 8,
                fontSize: 13,
                fontFamily: "'JetBrains Mono', monospace",
                background: "#fff",
                outline: "none",
                boxSizing: "border-box",
              }}
              onFocus={(e) => e.target.style.borderColor = "#1a5c3a"}
              onBlur={(e) => e.target.style.borderColor = "#d0d5d0"}
            />
            <PrintButton onClick={printMeds} label="Print Meds" />
          </div>
          <div style={{ overflowX: "auto", background: "#fff", borderRadius: 8, border: "1px solid #e2e6e2" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
              <thead>
                <tr style={{ background: "#fafcfa" }}>
                  {[
                    ["name", "Medication"],
                    ["class", "Class"],
                    ["brand", "Brand Name"],
                    ["dosage", "Dosage"],
                    ["indication", "Indication"],
                    ["contraindications", "Contraindications"],
                    ["priceRange", "Price"],
                  ].map(([col, label]) => (
                    <th key={col} style={thStyle(col, medSortCol)} onClick={() => handleMedSort(col)}>
                      {label}
                      <SortIcon active={medSortCol === col} direction={medSortDir} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredMeds.map((m, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#fafcfa" }}>
                    <td style={{ ...tdStyle, fontWeight: 600, color: "#1a5c3a" }}>{m.name}</td>
                    <td style={tdStyle}><Badge color="#5a3a8a">{m.class}</Badge></td>
                    <td style={tdStyle}>{m.brand}</td>
                    <td style={{ ...tdStyle, fontSize: 12 }}>{m.dosage}</td>
                    <td style={tdStyle}>{m.indication}</td>
                    <td style={{ ...tdStyle, fontSize: 12, color: "#8a4a2a" }}>{m.contraindications}</td>
                    <td style={{ ...tdStyle, textAlign: "center" }}>{m.priceRange}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{
        padding: "20px 28px",
        textAlign: "center",
        fontSize: 11,
        color: "#999",
        borderTop: "1px solid #e8ece8",
        marginTop: 40,
      }}>
        LensRef Prototype · Data shown is for demonstration purposes · Verify all parameters with manufacturer specifications
      </div>
    </div>
  );
}
