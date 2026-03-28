import mammoth from "mammoth";

export async function parseBenchmarkDoc(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  // We use HTML to ensure we can see the table borders and cell breaks
  const { value: html } = await mammoth.convertToHtml({ arrayBuffer });
  
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const rows = Array.from(doc.querySelectorAll("tr"));

  const categories: Record<string, any> = {
    A: { code: "A", title: "Benchmark Compliance", weightTotal: 0, criteria: [] },
    B: { code: "B", title: "Financial Management", weightTotal: 0, criteria: [] },
    C: { code: "C", title: "Governance", weightTotal: 0, criteria: [] },
    D: { code: "D", title: "Spiritual Growth and Evangelism", weightTotal: 0, criteria: [] },
    E: { code: "E", title: "Physical Growth and Development", weightTotal: 0, criteria: [] },
    F: { code: "F", title: "Information Communication and Technology", weightTotal: 0, criteria: [] },
    G: { code: "G", title: "Corporate Social Responsibility", weightTotal: 0, criteria: [] }
  };

  let activeSubHeader = "";

  rows.forEach((row) => {
    const cells = Array.from(row.querySelectorAll("td")).map(td => td.textContent?.trim() || "");
    
    // Skip empty rows or header rows
    if (cells.length < 2 || cells[0] === "Serial No") return;

    // 1. Detect Sub-headers (e.g., A1, B2) - usually 2 cells long in Word tables
    const subHeaderMatch = cells[0].match(/^([A-G][1-9])$/i);
    if (subHeaderMatch) {
      activeSubHeader = cells[1];
      return;
    }

    // 2. Detect Criteria (e.g., A1.1, D3.5) - usually 5 cells long
    const criteriaMatch = cells[0].match(/^([A-G])\d+\.\d+/i);
    if (criteriaMatch && cells.length >= 4) {
      const pillarKey = criteriaMatch[1].toUpperCase();
      
      // Clean numerical values
      const weight = parseFloat(cells[3]) || 0;
      const target = parseFloat(cells[4]?.replace(/[^0-9.]/g, '')) || 0;

      if (categories[pillarKey]) {
        categories[pillarKey].criteria.push({
          serialNo: cells[0],
          description: activeSubHeader ? `${activeSubHeader}: ${cells[1]}` : cells[1],
          unitOfMeasure: cells[2] || "No's",
          weight: weight,
          target: target
        });
        categories[pillarKey].weightTotal += weight;
      }
    }
  });

  return Object.values(categories).filter(cat => cat.criteria.length > 0);
}