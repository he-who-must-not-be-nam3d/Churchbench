"use client";

import { useEffect } from "react";

export default function TableResponsiveHelper() {
  useEffect(() => {
    const tables = document.querySelectorAll<HTMLTableElement>(
      "table.responsive-table",
    );

    tables.forEach((table) => {
      const headers = Array.from(table.querySelectorAll("thead th")).map(
        (th) => th.textContent?.trim() || "",
      );

      table.querySelectorAll<HTMLTableRowElement>("tbody tr").forEach((row) => {
        row
          .querySelectorAll<HTMLTableCellElement>("td")
          .forEach((cell, idx) => {
            if (!cell.hasAttribute("data-label")) {
              const label = headers[idx] || "";
              cell.setAttribute("data-label", label);
            }
          });
      });
    });
  }, []);

  return null;
}
