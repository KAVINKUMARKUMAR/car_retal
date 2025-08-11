import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { useLocation } from "react-router-dom";
import "./CarDetailPage.css";
export default function CarDetailPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  
  const navigate = useNavigate();
  const tripType = searchParams.get("trip_type");
  const pickupLocation = searchParams.get("pickup_location");
  // Coupon and benefit etc. data
  const { state: searchState } = useLocation();
  const tempId = searchState?.tempId || null;
  const cancellationRules = [
    "Free cancellation up to 24 hours before pickup.",
    "50% refund if cancelled 12–24 hours before pickup.",
    "No refund if cancelled within 12 hours of pickup.",
    "Full refund in case of vehicle unavailability.",
    "A processing fee of ₹200 applies for all cancellations."
  ];

  const coupons = [
    {
      id: 1,
      code: "SAVE10",
      percentage: 10,
      description: "Get 10% off on your booking",
      logo: "https://via.placeholder.com/40",
    },
    {
      id: 2,
      code: "FEST20",
      percentage: 20,
      description: "Festive offer – Save 20%",
      logo: "https://via.placeholder.com/40",
    },
  ];

  // State hooks (all at top per React rules)
  const [carDetails, setCarDetails] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("Location");
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [couponOpen, setCouponOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [openIndex, setOpenIndex] = useState(null);
  const [pickupDateTime, setPickupDateTime] = useState("");
  const [dropoffDateTime, setDropoffDateTime] = useState("");
  const [editingPickup, setEditingPickup] = useState(false);
  const [editingDropoff, setEditingDropoff] = useState(false);
  // Section refs for smooth scroll
  const locationRef = useRef(null);
  const descriptionRef = useRef(null);
  const featuresRef = useRef(null);
  const benefitsRef = useRef(null);
  const cancellationRef = useRef(null);
  const inclusionsRef = useRef(null);
  const faqsRef = useRef(null);
  // Add these states at the top


  useEffect(() => {
    if (searchState?.start_datetime) {
      setPickupDateTime(searchState.start_datetime);
    }
    if (searchState?.end_datetime) {
      setDropoffDateTime(searchState.end_datetime);
    }
  }, [searchState]);

  // Fetch car details
  useEffect(() => {
    async function fetchCarDetails() {
      try {
        const token = localStorage.getItem("token");
        console.log(token)
        const res = await fetch(`http://localhost:8000/api/cars/${id}/`, {
          headers: {
            Authorization: `Token 22d105e5441b4f4319779322913b56b2f75d639d`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(errText || "Failed to fetch car details");
        }
        const data = await res.json();
        setCarDetails(data);
      } catch (err) {
        setError(err.message);
      }
    }
    fetchCarDetails();
  }, [id]);

  // Coupon logic
  const handleApplyCoupon = (coupon) => {
    setAppliedCoupon(coupon);
    const basePrice = Number(carDetails.base_fare || 0);
    const planFee = selectedPlan ? Number(carDetails[`${selectedPlan.toLowerCase()}_price`] || 0) : 0;
    const subtotal = basePrice + planFee;
    const discount = (subtotal * coupon.percentage) / 100;
    setDiscountAmount(discount);
  };

  // Booking logic (make backend call for booking)
  const handleBookNow = () => {
    if (!selectedPlan) {
      alert("Please select a plan before proceeding.");
      return;
    }

    navigate("/booking", {
      state: {
        tempId, // pass temp booking ID if available
        carId: carDetails.id,
        car: carDetails,
        totalPrice,
        plan: selectedPlan,
        coupon: appliedCoupon,
        start_datetime: pickupDateTime,
        end_datetime: dropoffDateTime,
      },
    });
  };




  const plans = [
  {
    name: "Max",
    price: 600,
    description: "Only pay Rs. 3000 in case of any incidentals",
    benefits: [
      "Full Damage Waiver",
      "Free Roadside Assistance",
      "Zero Deductible",
      "Priority Support"
    ]
  },
  {
    name: "Plus",
    price: 550,
    description: "Moderate coverage & assistance",
    benefits: [
      "Partial Damage Waiver",
      "Free Roadside Assistance",
      "₹10,000 Deductible"
    ]
  },
  {
    name: "Basic",
    price: 459,
    description: "Essential protection for budget trips",
    benefits: [
      "Third-party liability coverage",
      "Paid Roadside Assistance"
    ]
  }
];

  const basePrice = Number(carDetails?.base_fare || 0);
  const selectedPlanObj = plans.find(p => p.name === selectedPlan);
  const tripFee = selectedPlanObj ? selectedPlanObj.price : 0;
  const totalPrice = basePrice + tripFee - discountAmount;

  
  // FAQs
  const faqs = [
    {
      question: "What documents do I need to rent a car?",
      answer: "You'll need a valid driver's license, a credit/debit card, and a form of photo ID such as a passport or national ID."
    },
    {
      question: "Is fuel included in the rental price?",
      answer: "Fuel is not included. You must return the car with the same fuel level as when you received it."
    },
    {
      question: "Can I add an additional driver?",
      answer: "Yes, you can add an additional driver for a small daily fee. The driver must also meet age and license requirements."
    },
    {
      question: "What happens if I return the car late?",
      answer: "Late returns may result in extra hourly charges or a full extra day charge, depending on our policy."
    },
    {
      question: "Is there a mileage limit?",
      answer: "Most rentals include unlimited mileage, but please check your booking confirmation to be sure."
    }
  ];

  // FAQ toggle
  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Tab navigation
  const tabs = [
    { name: "Location", ref: locationRef },
    { name: "Description", ref: descriptionRef },
    { name: "Features", ref: featuresRef },
    { name: "Benefits", ref: benefitsRef },
    { name: "Cancellation", ref: cancellationRef },
    { name: "Inclusions/Exclusions", ref: inclusionsRef },
    { name: "FAQs", ref: faqsRef },
  ];

  const scrollToSection = (ref, name) => {
    setActiveTab(name);
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Error or loading state
  if (error) {
    return <p style={{ color: "red", textAlign: "center" }}>{error}</p>;
  }
  if (!carDetails) {
    return <p style={{ textAlign: "center" }}>Loading...</p>;
  }

  return (
    <div style={{
      display: "flex", // main flex row
      alignItems: "flex-start",
      gap: "32px",
      minHeight: "100vh",
      background: "#f5f5f5",
      padding: "32px 4vw 32px 8vw",
      maxWidth: "1550px",
      margin: "0 auto",
    }}>
      {/* LEFT COLUMN: main content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Back */}
        <div
          style={{
            padding: "16px 0",
            cursor: "pointer",
            color: "#007bff",
            fontWeight: "500",
          }}
          onClick={() => navigate(-1)}
        >
          &lt; Back
        </div>

        {/* Images */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: "10px",
            marginBottom: "20px",
          }}
        >
          <img
            src={carDetails.images?.[0]?.image || "/fallback.jpg"}
            alt={carDetails.images?.[0]?.alt_text || carDetails.name}
            style={{
              width: "100%",
              borderRadius: "6px",
              objectFit: "cover",
              minHeight: 240,
              height: 500,
            }}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              overflowX: "hidden",
              gap: "10px",
              maxHeight: "500px",
              paddingBottom: "4px",
              overflowY: "auto",
            }}
            className="thumbnail-scroll"
          >
            {carDetails.images?.slice(1).map((img, i) => (
              <img
                key={img.id}
                src={img.image}
                alt={img.alt_text || `${carDetails.name} view ${i + 2}`}
                style={{
                  width: "267px",
                  height: "23%",
                  borderRadius: "6px",
                  objectFit: "cover",
                  minHeight: 150,
                  flexShrink: 0, // prevents image from shrinking
                  cursor: "pointer",
                }}
              />
            ))}
          </div>
        </div>

        {/* Meta */}
        <h1>{carDetails.name}</h1>
        <p style={{ color: "#666" }}>
          {carDetails.model_year} • {carDetails.fuel ? carDetails.fuel.name : ""} •{" "}
          {carDetails.seats || "-"} seats
        </p>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            gap: "20px",
            borderBottom: "1px solid #ddd",
            position: "sticky",
            top: 0,
            background: "#fff",
            zIndex: 10,
            padding: "10px 0",
            marginBottom: "20px",
          }}
        >
          {tabs.map((tab) => (
            <span
              key={tab.name}
              onClick={() => scrollToSection(tab.ref, tab.name)}
              style={{
                cursor: "pointer",
                paddingBottom: "5px",
                borderBottom:
                  activeTab === tab.name
                    ? "2px solid #007bff"
                    : "2px solid transparent",
                color: activeTab === tab.name ? "#007bff" : "#333",
                fontWeight: activeTab === tab.name ? "600" : "400",
              }}
            >
              {tab.name}
            </span>
          ))}
        </div>

        {/* Location */}
        <section ref={locationRef} style={{ marginBottom: "40px" }}>
          <h2>Location</h2>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <p>{carDetails.location ? carDetails.location.name : ""}</p>
            {carDetails.location.map_url && (
              <button
                onClick={() => window.open(carDetails.location.map_url, "_blank")}
                style={{
                  background: "#007bff",
                  color: "#fff",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Get Location
              </button>
            )}
          </div>
        </section>

        {/* Description */}
        <section ref={descriptionRef} style={{ marginBottom: "40px" }}>
          <h2>Description</h2>
          <p>{carDetails.description || "No description available"}</p>
        </section>

        {/* Features */}
        <section ref={featuresRef} style={{ marginBottom: "40px" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h2>Features</h2>
            {carDetails.features?.length > 9 && (
              <button
                onClick={() => setShowAllFeatures(!showAllFeatures)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#007bff",
                  cursor: "pointer",
                }}
              >
                {showAllFeatures ? "View Less" : "View More"}
              </button>
            )}
          </div>
          {carDetails.features && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "10px",
              }}
            >
              {(showAllFeatures
                ? carDetails.features
                : carDetails.features.slice(0, 9)
              ).map((f, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "#f9f9f9",
                    padding: "10px",
                    borderRadius: "4px",
                  }}
                >
                  {f}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Benefits */}
        <section ref={benefitsRef} style={{ marginBottom: "40px" }}>
          <h2>Travel with confidence</h2>
          <p style={{ fontSize: "0.9rem", color: "#777" }}>
            Choose a plan & secure your trip
          </p>
          <div style={{ display: "flex", gap: "20px" }}>
            {plans.map((plan) => (
              <div
                key={plan.name}
                onClick={() => setSelectedPlan(selectedPlan === plan.name ? null : plan.name)}
                style={{
                  flex: 1,
                  padding: "16px",
                  borderRadius: "6px",
                  border:
                    selectedPlan === plan.name
                      ? "2px solid #007bff"
                      : "1px solid #ddd",
                  background:
                    selectedPlan === plan.name ? "#e6f0ff" : "transparent",
                  cursor: "pointer",
                }}
              >
                <h3>{plan.name}</h3>
                <p style={{ fontSize: "1.2rem", fontWeight: 600 }}>
                  ₹{plan.price}
                </p>
                {plan.description && (
                  <p style={{ fontSize: "0.85rem", color: "#777" }}>
                    {plan.description}
                  </p>
                )}
                {plan.benefits && (
                  <ul style={{ fontSize: "0.8rem", marginTop: "6px", color: "#555" }}>
                    {plan.benefits.map((b, idx) => (
                      <li key={idx}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>


        {/* Cancellation */}
        <section ref={cancellationRef} style={{ marginBottom: "40px" }}>
          <h2>Cancellation</h2>
          <ul>
            {cancellationRules.length
              ? cancellationRules.map((rule, idx) => (
                  <li key={idx}>{rule}</li>
                ))
              : <li>No cancellation policy available</li>}
          </ul>
        </section>

        {/* Inclusions/Exclusions */}
        <section ref={inclusionsRef} style={{ marginBottom: "40px" }}>
          <h2>Inclusions / Exclusions</h2>
          <p>
            <strong>Inclusions:</strong><br />
            - Basic insurance coverage including collision damage waiver and theft protection.<br />
            - Taxes, vehicle registration, and government fees.<br />
            - Emergency roadside assistance.<br />
            - Unlimited mileage (subject to contract).<br />
            - Standard vehicle equipment.<br /><br />

            <strong>Exclusions:</strong><br />
            - Fuel costs (return car with same fuel level).<br />
            - Security deposit or credit card hold.<br />
            - Optional extras such as GPS, child seats.<br />
            - Traffic violations and fines.<br />
            - Damage caused by unauthorized use or negligence.<br />
            - Wear and tear or mechanical issues not caused by accidents.<br />
          </p>
        </section>

        {/* FAQs */}
        <section ref={faqsRef} style={{ marginBottom: "40px", maxWidth: "800px", margin: "0 auto" }}>
  <h2 style={{ fontSize: "1.6rem", marginBottom: "20px", color: "#224466", fontWeight: "700" }}>FAQs</h2>
  <ul style={{ listStyleType: "none", padding: 0, margin: 0 }}>
    {faqs.length ? (
      faqs.slice(0, 5).map((faq, idx) => {
        const isOpen = openIndex === idx;
        return (
          <li
            key={idx}
            style={{
              background: isOpen ? "#eef7ff" : "#fff",
              borderRadius: "14px",
              boxShadow: isOpen
                ? "0 6px 20px rgba(0,122,255,0.15)"
                : "0 4px 12px rgba(0,0,0,0.06)",
              borderLeft: isOpen ? "4px solid #007aff" : "4px solid transparent",
              padding: "16px 20px",
              marginBottom: "15px",
              transition: "all 0.3s ease",
              cursor: "pointer"
            }}
          >
            <button
              onClick={() => toggleFAQ(idx)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "1.05rem",
                fontWeight: "700",
                textAlign: "left",
                width: "100%",
                color: "#224466",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}
            >
              {faq.question}
              <span
                style={{
                  fontSize: "1.2rem",
                  transition: "transform 0.3s ease",
                  transform: isOpen ? "rotate(180deg)" : "rotate(0deg)"
                }}
              >
                ▼
              </span>
            </button>

            <div
              style={{
                marginTop: isOpen ? "12px" : "0",
                fontSize: "0.95rem",
                color: "#444",
                lineHeight: "1.5",
                maxHeight: isOpen ? "500px" : "0",
                overflow: "hidden",
                opacity: isOpen ? 1 : 0,
                transition: "max-height 0.35s ease, opacity 0.35s ease"
              }}
            >
              {faq.answer}
            </div>
          </li>
        );
      })
    ) : (
      <li>No FAQs available</li>
    )}
  </ul>
</section>

      </div>

      {/* RIGHT COLUMN: ASIDE (sticky coupon panel, price summary) */}
      <aside
        style={{
          width: "30vw",
          minWidth: "330px",
          maxWidth: "430px",
          padding: "18px 16px 28px 16px",
          background: "#fff",
          borderRadius: "12px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
          position: "sticky",
          top: "40px",
          alignSelf: "flex-start"
        }}
      >
        {/* Coupons Section */}
        <div>
  <h3
    style={{
      cursor: "pointer",
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "18px",
      fontSize: "1.4rem",
      fontWeight: "700",
      color: "#224466"
    }}
    onClick={() => setCouponOpen(!couponOpen)}
  >
    Coupons <span>{couponOpen ? "▲" : "▼"}</span>
  </h3>

  {couponOpen &&
    coupons.map((c) => (
      <div
        key={c.id}
        style={{
          border: "1px solid #e1e6f0",
          borderRadius: "14px",
          padding: "16px",
          marginBottom: "14px",
          background: "linear-gradient(135deg, #f9fbff, #eef3ff)",
          boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
          transition: "transform 0.25s ease, box-shadow 0.25s ease",
          cursor: "pointer"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-3px)";
          e.currentTarget.style.boxShadow = "0 8px 18px rgba(0,0,0,0.12)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 4px 10px rgba(0,0,0,0.05)";
        }}
      >
        {/* Header row */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
          {/* Logo circle */}
          <div
            style={{
              width: "50px",
              height: "50px",
              borderRadius: "50%",
              background: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
              marginRight: "12px"
            }}
          >
            <img src={c.logo} alt="logo" style={{ width: "80%", height: "80%" }} />
          </div>

          {/* Code & discount */}
          <div style={{ flex: 1 }}>
            <span
              style={{
                background: "#ff6f00",
                padding: "5px 12px",
                borderRadius: "20px",
                color: "#fff",
                fontWeight: "bold",
                fontSize: "1rem",
                marginRight: "10px",
                boxShadow: "0px 1px 4px rgba(255,111,0,0.4)",
                letterSpacing: "0.5px"
              }}
            >
              {c.code}
            </span>
            <span
              style={{
                color: "#d32f2f",
                fontWeight: "700",
                fontSize: "1.05rem"
              }}
            >
              {c.percentage}% OFF
            </span>
          </div>
        </div>

        {/* Description */}
        <div
          style={{
            fontSize: "0.95rem",
            color: "#444",
            marginBottom: "12px",
            lineHeight: "1.4"
          }}
        >
          {c.description}
        </div>

        {/* Apply button */}
        <button
          onClick={() => handleApplyCoupon(c)}
          style={{
            display: "block",
            marginLeft: "auto",
            background: "#007bff",
            color: "#fff",
            border: "none",
            padding: "8px 22px",
            borderRadius: "8px",
            fontWeight: "bold",
            cursor: "pointer",
            fontSize: "0.95rem",
            transition: "background 0.2s ease"
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#005ecc")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#007bff")}
        >
          Apply
        </button>
      </div>
    ))}
</div>


        {/* Price Summary */}
        <div style={{ marginTop: "20px", marginBottom: "14px" }}>
          <h3 style={{ marginBottom: "12px" }}>Price Summary</h3>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span>Car Rental Fare</span>
            <span>₹{basePrice.toFixed(2)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span>Trip Protection Fee</span>
            <span>₹{tripFee.toFixed(2)}</span>
          </div>
          {appliedCoupon && (
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              color: "#4caf50",
              marginBottom: 8,
              fontWeight: "500"
            }}>
              <span>Coupon Discount ({appliedCoupon.code})</span>
              <span>- ₹{discountAmount.toFixed(2)}</span>
            </div>
          )}
          <hr />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "1.25rem",
              fontWeight: "bold",
              marginTop: "12px"
            }}
          >
            <h3 style={{ margin: 0 }}>Total Price</h3>
            <span>₹{totalPrice.toFixed(2)}</span>
          </div>
          <button
            onClick={handleBookNow}
            style={{
              width: "100%",
              padding: "14px",
              marginTop: "20px",
              background: "#4caf50",
              color: "#fff",
              border: "none",
              borderRadius: "7px",
              fontSize: "1.1rem",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Book Now
          </button>
        </div>
      </aside>
    </div>
  );
}
