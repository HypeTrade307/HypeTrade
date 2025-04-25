// @ts-nocheck
import { useState, useEffect } from "react";

const HeatMapend = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("/api/stocks/top-sentiment")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch top-sentiment");
        return res.json();
      })
      .then((jsonData) => {
        const processed = jsonData.map((item) => ({
          name: item.name,
          size: parseFloat(item.size as any),
          value: Math.abs(parseFloat(item.size as any)),
        }));
        setData(processed);
      })
      .catch((e) => {
        console.error("Error loading heatmap data:", e);
        setData([]);
      });
  }, []);

  const handleDownloadCSV = () => {
    if (!data.length) return;
    const header = ["name", "size", "value"].join(",") + "\n";
    const rows = data
      .map((d) => [d.name, d.size, d.value].join(","))
      .join("\n");
    const csvContent = header + rows;
    const blob = new Blob([csvContent], { type: "text/csv" });
    downloadBlob(blob, "heatmap_data.csv");
  };

  const handleDownloadTXT = () => {
    if (!data.length) return;
    const textContent = data.map(d => JSON.stringify(d)).join("\n");
    const blob = new Blob([textContent], { type: "text/plain" });
    downloadBlob(blob, "heatmap_data.txt");
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Raw HeatMap Data</h2>

      <button 
        onClick={handleDownloadCSV}
        type="submit" className="submit-button"
      >
        Download CSV
      </button>

      <button
        onClick={handleDownloadTXT}
        type="submit" className="submit-button"
      >
        Download Text
      </button>
    </div>
  );
};

export default HeatMapend;
