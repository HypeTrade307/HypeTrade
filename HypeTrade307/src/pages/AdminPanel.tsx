// pages/AdminPanel.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "./AdminPanel.css"; // optional styling

interface Flag {
    flag_id: number;
    user_id: number;
    flag_type: "user" | "post" | "comment" | "thread";
    target_id: number;
    reason?: string;
    created_at: string;
}

export default function AdminPanel() {
    const [flags, setFlags] = useState<Flag[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            toast.error("Not authenticated");
            navigate("/login");
            return;
        }
        axios.get("http://localhost:8080/flag", {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => setFlags(res.data))
            .catch((err) => {
                console.error(err);
                toast.error("Failed to fetch flags");
            });
    }, []);

    const handleRemove = async (flag_id: number) => {
        const token = localStorage.getItem("token");
        try {
            await axios.delete(`http://localhost:8080/flag/${flag_id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success("Flag removed");
            setFlags(flags.filter(f => f.flag_id !== flag_id));
        } catch (error) {
            console.error(error);
            toast.error("Error removing flag");
        }
    };

    return (
        <div className="admin-panel">
            <h2>Admin Panel - Flagged Content</h2>
            {flags.length === 0 ? (
                <p>No flagged content.</p>
            ) : (
                <table className="flag-table">
                    <thead>
                        <tr>
                            <th>Flag ID</th>
                            <th>Type</th>
                            <th>Target ID</th>
                            <th>Reason</th>
                            <th>Created</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {flags.map((flag) => (
                            <tr key={flag.flag_id}>
                                <td>{flag.flag_id}</td>
                                <td>{flag.flag_type}</td>
                                <td>{flag.target_id}</td>
                                <td>{flag.reason || "No reason"}</td>
                                <td>{new Date(flag.created_at).toLocaleString()}</td>
                                <td>
                                    <button onClick={() => handleRemove(flag.flag_id)}>Keep</button>
                                    {/* Later: add Delete functionality too */}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}