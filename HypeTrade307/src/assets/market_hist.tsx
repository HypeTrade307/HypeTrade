import {useState} from "react";
import { Button } from "react-bootstrap";

const JsonCreator = () => {
    const [jsonData, setJsonData] = useState({});
    const [key, setKey] = useState("");
    const [value, setValue] = useState("");

    const addEntry = () => {
        if (key && value) {
            setJsonData((prevData) => ({ ...prevData, [key]: value }));
            setKey("");
            setValue("");
        }
    };

    const downloadJson = () => {
        const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: "application/json" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "data.json";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="p-4 max-w-md mx-auto bg-white shadow-lg rounded-lg">
            <h2 className="text-xl font-bold mb-4">JSON Creator</h2>
            <input
                className="border p-2 w-full mb-2"
                type="text"
                placeholder="Key"
                value={key}
                onChange={(e) => setKey(e.target.value)}
            />
            <input
                className="border p-2 w-full mb-2"
                type="text"
                placeholder="Value"
                value={value}
                onChange={(e) => setValue(e.target.value)}
            />
            <Button className="w-full mb-2" onClick={addEntry}>Add Entry</Button>
            <Button className="w-full" onClick={downloadJson}>Download JSON</Button>
            <pre className="mt-4 p-2 bg-gray-100 rounded">{JSON.stringify(jsonData, null, 2)}</pre>
        </div>
    );
};

export default JsonCreator;
