// src/components/QuotationInfo.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function QuotationInfo() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    developerType: "",
    projectRegion: "",
    projectName: "",
    plotArea: "",
    developerName: "",
    contactMobile: "",
    contactEmail: "",
    validity: "7 days",
    paymentSchedule: "50%",
    reraNumber: "",
    serviceSummary: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:3001/api/quotations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          plotArea: parseFloat(form.plotArea) || 0,
          termsAccepted: false,
          applicableTerms: [],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save quotation");

      navigate(`/quotations/${data.data.id}/services`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="quotation-info">
      <h2>Create Quotation</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <input name="developerType" placeholder="Developer Type" value={form.developerType} onChange={handleChange} />
      <input name="projectRegion" placeholder="Project Region" value={form.projectRegion} onChange={handleChange} />
      <input name="projectName" placeholder="Project Name" value={form.projectName} onChange={handleChange} />
      <input name="plotArea" placeholder="Plot Area" type="number" value={form.plotArea} onChange={handleChange} />
      <input name="developerName" placeholder="Developer Name" value={form.developerName} onChange={handleChange} />
      <input name="contactMobile" placeholder="Contact Mobile" value={form.contactMobile} onChange={handleChange} />
      <input name="contactEmail" placeholder="Contact Email" value={form.contactEmail} onChange={handleChange} />
      <input name="reraNumber" placeholder="RERA Number" value={form.reraNumber} onChange={handleChange} />
      <textarea name="serviceSummary" placeholder="Service Summary" value={form.serviceSummary} onChange={handleChange} />

      <button onClick={handleSubmit} disabled={loading}>
        {loading ? "Saving..." : "Next Step"}
      </button>
    </div>
  );
}
