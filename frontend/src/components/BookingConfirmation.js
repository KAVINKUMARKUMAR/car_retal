import React, { useState, useEffect } from "react";
import axios from "axios";                         // Import axios
import { useNavigate, useLocation } from "react-router-dom";

export default function BookingConfirmation() {
  const navigate = useNavigate();
  const location = useLocation();

  // State to hold booking data fetched from backend
  const [bookingData, setBookingData] = useState(null);

  // Countdown timer state (10 minutes)
  const [secondsLeft, setSecondsLeft] = useState(600);

  // Payment method states
  const [paymentMethod, setPaymentMethod] = useState(null); // 'UPI', 'Card', 'NetBanking'
  const [selectedUPIApp, setSelectedUPIApp] = useState(null);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    expiry: "",
    cc: "",
    saveCard: false,
  });
  const [selectedBank, setSelectedBank] = useState(null);

  // Extract needed state from location.state
  const { tempId, carId, ...restState } = location.state || {};

  // Fetch saved booking data if tempId exists
  useEffect(() => {
    if (!tempId) return;
   // or other storage
    axios.get(
      `http://localhost:8000/api/booking-temp/${tempId}/`,
      {
        headers: {
          Authorization: `Token 22d105e5441b4f4319779322913b56b2f75d639d`, // or `Bearer ${token}` if JWTAuth
        }
      }
    )
    .then((res) => setBookingData(res.data))
    .catch((err) => {
      console.error("Failed to fetch temp booking", err.response?.data || err.message);
    });
  }, [tempId]);


  // Timer countdown effect
  useEffect(() => {
    if (secondsLeft <= 0) {
      alert("Time expired! Returning to previous page.");
      navigate(-1);
      return;
    }
    const timerId = setInterval(() => {
      setSecondsLeft((s) => s - 1);
    }, 1000);
    return () => clearInterval(timerId);
  }, [secondsLeft, navigate]);

  // Format timer mm:ss
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Format datetime nicely
  const formatDateTime = (dtString) => {
    if (!dtString) return "";
    try {
      const dt = new Date(dtString);
      return dt.toLocaleString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dtString;
    }
  };

  const UPI_APPS = [
    { id: "gpay", name: "Google Pay", logo: "/logos/gpay.png" },
    { id: "phonepay", name: "Phone Pe", logo: "/logos/phonepe.png" },
    { id: "paytm", name: "Paytm UPI", logo: "/logos/paytm.png" },
  ];

  const BANKS = [
    { id: "sbi", name: "State Bank of India", logo: "/logos/sbi.png" },
    { id: "hdfc", name: "HDFC Bank", logo: "/logos/hdfc.png" },
    { id: "icici", name: "ICICI Bank", logo: "/logos/icici.png" },
  ];

  // Pay button handler (simplified stub)
  const handlePay = async () => {
    try {
      await axios.post(`http://localhost:8000/api/confirm-booking/`, {
        temp_id: tempId,
        payment_method: paymentMethod,
        car_id: carId,
        plan: restState.plan,
      });
      alert("Booking confirmed!");
      navigate("/thank-you");
    } catch (error) {
      console.error("Error confirming booking", error);
      alert("Failed to confirm booking");
    }
  };

  // Use bookingData if fetched, else fallback to passed state
  const dataToShow = bookingData || restState;

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 900, margin: "auto", padding: 20 }}>
      {/* Top Nav */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#000",
          padding: "10px 16px",
          borderBottom: "1px solid transparent",
          color: "#fff",
          fontWeight: "normal",
        }}
      >
        <button
          style={{
            background: "none",
            border: "none",
            color: "#fff",
            fontSize: 18,
            cursor: "pointer",
            lineHeight: 1,
            padding: 0,
            margin: 0,
          }}
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          &#8592;
        </button>

        <button
          onClick={handlePay}
          style={{
            background: "#4caf50",
            color: "white",
            border: "none",
            padding: "8px 20px",
            cursor: "pointer",
            fontWeight: "normal",
          }}
          aria-label="Proceed to pay"
          disabled={
            !paymentMethod ||
            (paymentMethod === "UPI" && !selectedUPIApp) ||
            (paymentMethod === "NetBanking" && !selectedBank) ||
            (paymentMethod === "Card" && !cardDetails.cardNumber)
          }
        >
          Pay ₹{dataToShow.totalPrice?.toFixed(2)}
        </button>
      </div>

      {/* Horizontal line */}
      <hr style={{ margin: 0, borderColor: "#ddd" }} />

      {/* Booking details */}
      <div style={{ marginTop: 16, fontSize: "1rem", lineHeight: 1.5, color: "#333" }}>
        {dataToShow.car && <div><strong>Car:</strong> {dataToShow.car.name}</div>}
        {dataToShow.plan && <div><strong>Plan:</strong> {dataToShow.plan}</div>}
        {dataToShow.coupon && (
          <div>
            <strong>Coupon:</strong> {dataToShow.coupon.code} ({dataToShow.coupon.percentage}% off)
          </div>
        )}
        {dataToShow.totalPrice !== undefined && <div><strong>Total Price:</strong> ₹{dataToShow.totalPrice.toFixed(2)}</div>}
        {dataToShow.start_datetime && (
          <div>
            <strong>Pickup Date & Time:</strong> {formatDateTime(dataToShow.start_datetime)}
          </div>
        )}
        {dataToShow.end_datetime && (
          <div>
            <strong>Drop-off Date & Time:</strong> {formatDateTime(dataToShow.end_datetime)}
          </div>
        )}
      </div>

      {/* Price lock + timer section */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          backgroundColor: "#fff9c4",
          padding: "12px 30px",
          alignItems: "center",
          gap: 8,
          marginTop: 16,
        }}
      >
        <div style={{ fontWeight: "bold", paddingLeft: 30 }}>PRICE LOCKED FOR 10 MINS</div>
        <div style={{ fontSize: "0.85rem", color: "#555" }}>Complete your Payment Soon</div>
        <div
          style={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            color: "#d32f2f",
            minWidth: 80,
            textAlign: "right",
            fontFamily: "monospace",
          }}
          aria-live="polite"
          aria-atomic="true"
        >
          {formatTime(secondsLeft)}
        </div>
      </div>

      {/* Payment container */}
      <div style={{ display: "flex", marginTop: 20, gap: 20 }}>
        {/* Left side - Payment options */}
        <div
          style={{
            width: "50%",
            boxSizing: "border-box",
            padding: 20,
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            borderRadius: 6,
            fontWeight: "normal",
          }}
        >
          <h3 style={{ marginTop: 0 }}>OTHER PAYMENT OPTIONS</h3>

          <div
            style={{
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              padding: 8,
              borderBottom: paymentMethod === "UPI" ? "2px solid #4caf50" : "1px solid #ddd",
              fontWeight: paymentMethod === "UPI" ? "bold" : "normal",
            }}
            onClick={() => {
              setPaymentMethod("UPI");
              setSelectedUPIApp(null);
            }}
          >
            <img src="/logos/upi.png" alt="UPI" style={{ width: 40, marginRight: 12 }} />
            <div>UPI</div>
          </div>

          <div
            style={{
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              padding: 8,
              borderBottom: paymentMethod === "Card" ? "2px solid #4caf50" : "1px solid #ddd",
              fontWeight: paymentMethod === "Card" ? "bold" : "normal",
            }}
            onClick={() => setPaymentMethod("Card")}
          >
            <img src="/logos/card.png" alt="Card" style={{ width: 40, marginRight: 12 }} />
            <div>Credit/Debit/ATM Card</div>
          </div>

          <div
            style={{
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              padding: 8,
              borderBottom: paymentMethod === "NetBanking" ? "2px solid #4caf50" : "1px solid #ddd",
              fontWeight: paymentMethod === "NetBanking" ? "bold" : "normal",
            }}
            onClick={() => setPaymentMethod("NetBanking")}
          >
            <img src="/logos/netbanking.png" alt="Net Banking" style={{ width: 40, marginRight: 12 }} />
            <div>Net Banking</div>
          </div>
        </div>

        {/* Right side - Payment details */}
        <div
          style={{
            width: "50%",
            boxSizing: "border-box",
            padding: 20,
            boxShadow: "0 4px 12px rgba(0,0,0,0.10)",
            borderRadius: 8,
            minHeight: 320,
            fontWeight: "normal",
          }}
        >
          {paymentMethod === "UPI" && (
            <>
              <h3>Select a UPI App</h3>
              <div>Amount: ₹{dataToShow.totalPrice?.toFixed(2)}</div>
              <div style={{ marginTop: 12 }}>
                {UPI_APPS.map((app) => (
                  <div
                    key={app.id}
                    onClick={() => setSelectedUPIApp(app.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      cursor: "pointer",
                      padding: "8px 0",
                      background: selectedUPIApp === app.id ? "#e8f5e9" : "transparent",
                      fontWeight: selectedUPIApp === app.id ? "bold" : "normal",
                      borderRadius: 4,
                    }}
                  >
                    <img src={app.logo} alt={app.name} style={{ width: 40, marginRight: 12 }} />
                    <div>{app.name}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {paymentMethod === "Card" && (
            <>
              <h3>Enter Card Details</h3>
              <div style={{ color: "#666", marginBottom: 8 }}>Amount: ₹{dataToShow.totalPrice?.toFixed(2)}</div>
              <input
                type="text"
                placeholder="Card Number"
                value={cardDetails.cardNumber}
                onChange={(e) => setCardDetails({ ...cardDetails, cardNumber: e.target.value })}
                style={{ width: "100%", padding: 8, marginBottom: 12 }}
              />
              <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                <input
                  type="text"
                  placeholder="MM/YY"
                  value={cardDetails.expiry}
                  onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                  style={{ flex: 1, padding: 8 }}
                />
                <input
                  type="text"
                  placeholder="CVC"
                  value={cardDetails.cc}
                  onChange={(e) => setCardDetails({ ...cardDetails, cc: e.target.value })}
                  style={{ flex: 1, padding: 8 }}
                />
              </div>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 12,
                  color: "#666",
                  marginBottom: 12,
                }}
              >
                <input
                  type="checkbox"
                  checked={cardDetails.saveCard}
                  onChange={(e) => setCardDetails({ ...cardDetails, saveCard: e.target.checked })}
                />
                Securely save card details
              </label>
            </>
          )}

          {paymentMethod === "NetBanking" && (
            <>
              <h3>Net Banking</h3>
              <div style={{ color: "#666", marginBottom: 8 }}>Amount: ₹{dataToShow.totalPrice?.toFixed(2)}</div>
              {BANKS.map((bank) => (
                <div
                  key={bank.id}
                  onClick={() => setSelectedBank(bank.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                    padding: "6px 0",
                    background: selectedBank === bank.id ? "#e8f5e9" : "transparent",
                    borderRadius: 4,
                    fontWeight: selectedBank === bank.id ? "bold" : "normal",
                  }}
                >
                  <img src={bank.logo} alt={bank.name} style={{ width: 40, marginRight: 12 }} />
                  <div>{bank.name}</div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
