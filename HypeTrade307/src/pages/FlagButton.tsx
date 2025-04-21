import React, { useState } from "react";
//@ts-nocheck
import axios from "axios";
import { toast } from "react-toastify";
import "./FlagButton.css";

interface FlagButtonProps {
  target_id: number;
  flag_type: "user" | "post" | "comment" | "thread";
}

const FlagButton: React.FC<FlagButtonProps> = ({ target_id, flag_type }) => {
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
          flag_type,
          target_id,
          reason,
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

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).classList.contains("flag-modal-overlay")) {
      setShowModal(false);
    }
  };

  return (
    <>
      <button className="flag-button" onClick={() => setShowModal(true)}>
        🚩 Flag
      </button>

      {showModal && (
        <div
          className="flag-modal-overlay"
          onClick={handleOverlayClick}
          style={{ zIndex: 3000 }}
        >
          <div className="flag-modal" onClick={(e) => e.stopPropagation()}>
            <h3>
              Flag This {flag_type.charAt(0).toUpperCase() + flag_type.slice(1)}
            </h3>
            <textarea
              placeholder="Reason (optional)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <div className="flag-modal-buttons">
              <button className="submit-button" onClick={handleSubmit}>Submit</button>
              <button className="cancel-button" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FlagButton;
