import { useState } from "react";
import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8000/api";

const Marketing = () => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);
    try {
      const token = localStorage.getItem("token");
     
     const response = await axios.post(
        `${API_BASE_URL}/admin/messages/broadcast`,{ content: message },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data && response.data.success) {
        setSuccess("Message sent to all users!");
        setMessage("");
      } else {
        setError(response.data.message || "Failed to send message.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to send message."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 24 }}>
      <h2>Send Marketing Notification</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label
            htmlFor="marketing-message"
            style={{ display: "block", marginBottom: 8 }}
          >
            Message to broadcast:
          </label>
          <textarea
            id="marketing-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            style={{ width: "100%", padding: 8, fontSize: 16 }}
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading || !message.trim()}
          style={{ padding: "10px 24px", fontSize: 16 }}
        >
          {loading ? "Sending..." : "Send Notification"}
        </button>
      </form>
      {success && (
        <div style={{ color: "green", marginTop: 16 }}>{success}</div>
      )}
      {error && <div style={{ color: "red", marginTop: 16 }}>{error}</div>}
    </div>
  );
};

export default Marketing;
