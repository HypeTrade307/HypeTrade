const ProfileDownloader = () => {
  const downloadFile = (type = "csv") => {
    const filename = type === "csv" ? "ProfileData.csv" : "ProfileData.txt";

    // Example content
    const csvContent = [
      ["tick", "name", "data"],
      ["appl", "apple", "1","10"],
      ["googl", "google", "2","20"]
    ]
      .map((row) => row.join(","))
      .join("\n");

    const textContent = `tick name, data\n
      appl apple 1 \n
      googl google 2 \n`;

    const blob = new Blob(
      [type === "csv" ? csvContent : textContent],
      { type: "text/plain;charset=utf-8" }
    );

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div >
      <button
        onClick={() => downloadFile("csv")}
      >
        Download CSV File
      </button>
      <button
        onClick={() => downloadFile("txt")}
      >
        Download Text File
      </button>
    </div>
  );
};

export default ProfileDownloader;
