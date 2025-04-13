// src/components/FlagButton.tsx
import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./FlagButton.css";

interface FlagButtonProps {
  targetId: number;
  flagType: "user" | "post" | "comment" | "thread";
}

const FlagButton: React.FC<FlagButtonProps> = ({ targetId, flagType }) => {
  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState("");

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You must be logged in to flag content.");
      return;
    }
    try {
      await axios.post(
        "http://localhost:8080/flag/",
        {
          target_id: targetId,
          flag_type: flagType,
          reason: reason,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Flag submitted successfully");
      setShowModal(false);
      setReason("");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to submit flag");
    }
  };

  return (
    <>
      <button className="flag-button" onClick={() => setShowModal(true)}>
        🚩 Flag
      </button>

      {showModal && (
        <div className="flag-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="flag-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Flag This {flagType.charAt(0).toUpperCase() + flagType.slice(1)}</h3>
            <textarea
              placeholder="Reason (optional)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <div className="flag-modal-actions">
              <button onClick={handleSubmit}>Submit</button>
              <button onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FlagButton;
