import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./CarHome.css";
import heroBg from '../images/peter-broomfield-m3m-lnR90uM-unsplash.jpg';
// Autosuggest Location Input
function LocationAutoSuggest({ id, label, value, onChange }) {
  const [suggestions, setSuggestions] = useState([]);
  const debounceTimer = useRef(null);

  const handleSearch = (search) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(async () => {
      if (!search || search.trim().length < 3) {
        setSuggestions([]);
        return;
      }
      try {
        const res = await axios.get(
          `http://localhost:8000/api/locations/?search=${encodeURIComponent(search)}`
        );
        const locs = Array.isArray(res.data) ? res.data : res.data?.results || [];
        setSuggestions(locs);
      } catch (e) {
        console.error("Location fetch error:", e);
        setSuggestions([]);
      }
    }, 300);
  };

  const handleSuggestionClick = (name) => {
    onChange(name);
    setSuggestions([]);
  };

  return (
    <div className="input-group" style={{ position: "relative" }}>
      <label htmlFor={id} style={{ display: "block", marginBottom: 4, color: "#555", fontSize: 14 }}>{label}</label>
      <input
        placeholder={label}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          handleSearch(e.target.value);
        }}
        autoComplete="off"
      />
      {suggestions.length > 0 && (
        <ul className="suggestions">
          {suggestions.map((loc) => (
            <li
              key={loc.id}
              onClick={() => handleSuggestionClick(loc.name)}
              style={{ cursor: "pointer" }}
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleSuggestionClick(loc.name)}
            >
              {loc.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Package selector for Hourly trips
function Packages({ selectedPackageId, onSelect }) {
  const [packages, setPackages] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:8000/api/packages/")
      .then(res => {
        const arr = Array.isArray(res.data) ? res.data : res.data?.results || [];
        setPackages(arr);
      })
      .catch(() => setPackages([]));
  }, []);

  return (
    <section className="packages-section">
      <h3 className="section-subheading">Packages</h3>
      <div className="packages-container">
        {packages.map(pkg => (
          <div
            key={pkg.id}
            className={`package-card ${selectedPackageId === pkg.id ? "selected" : ""}`}
            tabIndex={0}
            role="button"
            onClick={() => onSelect(pkg.id)}
            onKeyDown={e => { if(e.key === "Enter" || e.key === " ") onSelect(pkg.id); }}
            aria-pressed={selectedPackageId === pkg.id}
          >
            <p>{pkg.hours} hr / {pkg.kms} km</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function CarHome() {
  const navigate = useNavigate();

  const TRIP_TYPES = [
    { key: "hourly", label: "Hourly" },
    { key: "outstation", label: "Outstation" },
    { key: "one_way", label: "One Way" },
    { key: "round_trip", label: "Round Trip" },
  ];
  const [selectedTrip, setSelectedTrip] = useState("hourly");

  // Form fields
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [drop, setDrop] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [returnTime, setReturnTime] = useState("");
  const [packageId, setPackageId] = useState("");
  const [days, setDays] = useState(1);
  const [driverRequired, setDriverRequired] = useState(true);

  // Data fetched for other sections
  const [cars, setCars] = useState([]);
  const [journeyCards] = useState([
    {
      id: 1,
      title: "SUVs and Family Cars",
      desc: "Spacious, safe and reliable. Perfect for your family outings, group trips and travels with extra luggage.",
      img: "/images/suv-family.jpg",
    },
    {
      id: 2,
      title: "Sedans",
      desc: "Comfort-oriented cars with premium interiors and smooth rides.",
      img: "/images/sedan.jpg",
    },
    {
      id: 3,
      title: "Hatchbacks",
      desc: "Compact and efficient, great for city driving and parking.",
      img: "/images/hatchback.jpg",
    },
    {
      id: 4,
      title: "Electric Cars",
      desc: "Eco-friendly vehicles with zero emissions.",
      img: "/images/electric.jpg",
    },
  ]);
  const [offers, setOffers] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [copiedId, setCopiedId] = useState(null);
  const [animateId, setAnimateId] = useState(null);
  // FAQ toggle state
  const attractions = [
    {
      title: "Discover Chennai's Local Attractions",
      desc: "Drive to iconic spots like Marina Beach, Kapaleeshwarar Temple, and Mahabalipuram with our self-drive cars.",
      img: heroBg,
    },
    {
      title: "Weekend Getaways",
      desc: "Escape the city to Pondicherry, Yelagiri Hills, or Kanchipuram with comfort.",
      img: heroBg,
    }
  ];
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const handleCopy = (code, id) => {
    navigator.clipboard.writeText(code)
      .then(() => {
        setCopiedId(id);
        setAnimateId(id); // trigger animation

        setTimeout(() => {
          setCopiedId(null);
          setAnimateId(null); // remove animation class
        }, 2000);
      })
      .catch(() => {
        alert("Failed to copy coupon");
      });
  };
  // Fetch dynamic data
  useEffect(() => {
    // Fetch cars for top cars section
    axios
      .get("http://localhost:8000/api/cars/") // Adjust endpoint if needed
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data?.results || [];
        setCars(data);
      })
      .catch((e) => {
        console.error("Failed fetching cars", e);
        setCars([]);
      });

    // Fetch offers
    axios
      .get("http://localhost:8000/api/offers/")
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data?.results || [];
        setOffers(data);
      })
      .catch(() => setOffers([]));

    // Fetch short-term rentals (using Package or your own API)
    axios
      .get("http://localhost:8000/api/packages/")
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data?.results || [];
        // We'll map to rental objects for display purposes
        setRentals(
          data.slice(0, 3).map((pkg, i) => ({
            id: pkg.id,
            title: pkg.label,
            desc: `Package with ${pkg.hours} hours and ${pkg.kms} kms.`,
            img: `/images/rental${i + 1}.jpg`,
            rules: [
              "Driver must be present during rental",
              "Fuel not included",
              "Vehicle must be returned on time",
              "Security deposit applicable",
            ],
          }))
        );
      })
      .catch(() => setRentals([]));

    // Fetch FAQs
    axios
      .get("http://localhost:8000/api/faqs/") // Replace with your actual FAQs endpoint
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data?.results || [];
        setFaqs(data);
      })
      .catch(() => {
        // fallback static FAQs if backend not ready
        setFaqs([
          {
            id: 1,
            question: "What documents are required to rent a car?",
            answer:
              "You need a valid driver's license, ID proof, and a credit/debit card for security deposit.",
          },
          {
            id: 2,
            question: "Can I cancel my booking?",
            answer:
              "Yes, cancellation policies may vary, but free cancellation is possible up to 24 hours before pickup.",
          },
          {
            id: 3,
            question: "Is there a mileage limit?",
            answer:
              "Most rentals include unlimited mileage. Please confirm your package details before booking.",
          },
          {
            id: 4,
            question: "Can I add an additional driver?",
            answer:
              "Yes, additional drivers can be added for a small fee and they must meet driver requirements.",
          },
          {
            id: 5,
            question: "What if the car breaks down?",
            answer:
              "Roadside assistance is included in most plans. Contact support immediately for help.",
          },
          {
            id: 6,
            question: "Are pets allowed in the car?",
            answer:
              "Pets are allowed only in select cars. Please check availability beforehand.",
          },
          {
            id: 7,
            question: "Can I extend my rental duration?",
            answer:
              "Extensions are possible subject to availability and additional charges.",
          },
          {
            id: 8,
            question: "What payments are accepted?",
            answer:
              "We accept all major credit/debit cards, UPI, and net banking.",
          },
        ]);
      });
  }, []);

  // Compose payload for backend
  const getSearchPayload = () => {
    switch (selectedTrip) {
      case "hourly":
        return {
          trip_type: "Hourly Rental",
          pickup_location: pickup,
          start_datetime: `${startDate}T${startTime}`,
          package: packageId,
          driver_required: driverRequired,
        };
      case "outstation":
        return {
          trip_type: "Outstation Rental",
          pickup_location: pickup,
          destination_location: destination,
          start_datetime: `${startDate}T${startTime}`,
          end_datetime: `${returnDate}T${returnTime}`,
          driver_required: driverRequired,
        };
      case "one_way":
        return {
          trip_type: "One Way",
          pickup_location: pickup,
          drop_location: drop,
          driver_required: driverRequired,
        };
      case "round_trip":
        return {
          trip_type: "Round Trip",
          pickup_location: pickup,
          destination_location: destination,
          start_datetime: `${startDate}T${startTime}`,
          end_datetime: `${returnDate}T${returnTime}`,
          num_days: days,
          driver_required: driverRequired,
        };
      default:
        return {};
    }
  };

  const isReady = () => {
    switch (selectedTrip) {
      case "hourly":
        return pickup && startDate && startTime && packageId;
      case "outstation":
        return pickup && destination && startDate && startTime && returnDate && returnTime;
      case "one_way":
        return pickup && drop;
      case "round_trip":
        return pickup && destination && startDate && startTime && returnDate && returnTime && days > 0;
      default:
        return false;
    }
  };

  // Handle search form submit
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!isReady()) {
      alert("Please fill all required fields before searching.");
      return;
    }
    const payload = getSearchPayload();
    try {
      const res = await axios.post("http://localhost:8000/api/booking-temp/", payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token 22d105e5441b4f4319779322913b56b2f75d639d`,
        },
      });
      const tempId = res.data?.temp_id;
      if (!tempId) {
        alert("Error: No booking reference returned from server.");
        return;
      }
      navigate("/cars-list", { state: { tempId, ...payload } });
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to connect to server. Please check backend logs.");
    }
  };

  // FAQ toggle handler
  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div>
      {/* Hero Search */}
      <section className="hero-section" style={{ backgroundImage: `url(${heroBg})` }} aria-label="Car Rental Search">
        <div className="search-container" role="form" aria-labelledby="search-heading">
          <h1 id="search-heading" className="sr-only">
            Book Your Cab
          </h1>
          <div className="trip-type-tabs" role="tablist" aria-label="Trip Types">
            {TRIP_TYPES.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={selectedTrip === key}
                className={selectedTrip === key ? "active" : ""}
                onClick={() => setSelectedTrip(key)}
                tabIndex={selectedTrip === key ? 0 : -1}
              >
                {label}
              </button>
            ))}
          </div>
          <form className="search-form" onSubmit={handleSearch} noValidate>
            <div className="inputs-grid">
              <LocationAutoSuggest
                id="pickup-location"
                label="Pickup Location"
                value={pickup}
                onChange={setPickup}
              />
              {(selectedTrip === "outstation" || selectedTrip === "round_trip") && (
                <LocationAutoSuggest label="Destination Location" value={destination} onChange={setDestination} />
              )}
              {selectedTrip === "one_way" && (
                <LocationAutoSuggest label="Drop Location" value={drop} onChange={setDrop} />
              )}
              {selectedTrip !== "one_way" && (
                <>
                  <div className="input-group">
                    <label className="visually-hidden" htmlFor="start-date">Pickup Date</label>
                    <input
                      id="start-date"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label className="visually-hidden" htmlFor="start-time">Pickup Time</label>
                    <input
                      id="start-time"
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      required
                    />
                  </div>
                </>
              )}
              {(selectedTrip === "outstation" || selectedTrip === "round_trip") && (
                <>
                  <div className="input-group">
                    <label className="visually-hidden" htmlFor="return-date">Return Date</label>
                    <input
                      id="return-date"
                      type="date"
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label className="visually-hidden" htmlFor="return-time">Return Time</label>
                    <input
                      id="return-time"
                      type="time"
                      value={returnTime}
                      onChange={(e) => setReturnTime(e.target.value)}
                      required
                    />
                  </div>
                </>
              )}
              
              {selectedTrip === "round_trip" && (
                <div className="input-group">
                  <label htmlFor="days">Days</label>
                  <input
                    id="days"
                    type="number"
                    min="1"
                    value={days}
                    onChange={(e) => setDays(Number(e.target.value))}
                  />
                </div>
              )}
              <div className="input-group checkbox-group">
                <label style={{
                      paddingTop: "10px",
                      position: "relative",
                    }}>
                  <input
                    className="checkbox-input"
                    type="checkbox"
                    checked={driverRequired}
                    style={{
                      width: "16px",
                      height: "16px",
                      cursor: "pointer",
                      marginRight: "8px",
                    }}
                    onChange={(e) => setDriverRequired(e.target.checked)}
                  />{" "}
                  <p>Driver Required</p>
                </label>
              </div>
            </div>
            {selectedTrip === "hourly" && <Packages selectedPackageId={packageId} onSelect={setPackageId} />}
            <button className="search-button" type="submit" disabled={!isReady()}>
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Top Cars Section */}
      <section className="section top-cars-section" aria-labelledby="top-cars-heading">
        <h2 id="top-cars-heading" className="section-heading">Top Cars in Chennai</h2>
        <div className="car-cards-container" role="list">
          {cars.map((car) => {
            const imageUrl = car.images?.[0]?.image || "/images/car-placeholder.jpg";
            const name = car.name || "Unknown";
            const year = car.model_year || "-";
            const transmission = car.transmission.type?.type || "-";
            const fuel = car.fuel?.name || "-";
            const seats = car.seats || "-";
            const price = car.base_fare ? `₹${car.base_fare}` : "-";
            const mileage = car.mileage ? `₹${car.mileage} per km` : "-";

            return (
              <article key={car.id} className="car-card" role="listitem" tabIndex={0}>
                <div className="car-image-container">
                  <img src={imageUrl} alt={`${name}`} className="car-image" />
                  <div className="car-image-overlay">
                    <span className="car-name">{name}</span>
                    <span className="car-year">{year}</span>
                  </div>
                  <div className="car-meta">
                    <span>{transmission}</span>
                    <span className="dot">·</span>
                    <span>{fuel}</span>
                    <span className="dot">·</span>
                    <span>{seats} seats</span>
                  </div>
                </div>
                <div className="car-info">

                  <div className="car-pricing-row">
                    <span className="car-price">Mileage</span>
                    <span className="car-price-per-km">{mileage}</span>
                  </div>
                  <div className="car-pricing-row">
                    <span className="car-price">Price</span>
                    <span className="car-price-per-km">{price}</span>
                  </div>
                </div>
              </article>

            );
          })}
        </div>
      </section>

      {/* Perfect Car for Every Journey */}
      <section className="section perfect-journey-section" aria-labelledby="perfect-journey-heading">
        <h2 id="perfect-journey-heading" className="section-heading">Perfect Car for Every Journey</h2>
        <p className="center-text two-line-paragraph">
          Choose from our wide range of cars that fit your style, budget, and journey needs.
        </p>
        <div className="perfect-journey-cards">
          {journeyCards.map((card) => (
            <div
              key={card.id}
              className="journey-card"
              style={{
                backgroundImage: `url(${heroBg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                borderRadius: "16px",
                height: "260px",
                position: "relative",
                overflow: "hidden",
                color: "#fff",
                cursor: "pointer",
                boxShadow: "0 3px 12px rgba(30, 75, 170, 0.1)"
              }}
            >
              {/* Overlay for better text visibility */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0.2))"
                }}
              ></div>

              {/* Text inside image */}
              <div
                style={{
                  position: "absolute",
                  bottom: "16px",
                  left: "16px",
                  right: "16px",
                  zIndex: 1
                }}
              >
                <h3 style={{ margin: 0, fontSize: "1.3rem", fontWeight: "700" }}>
                  {card.title}
                </h3>
                <p style={{ margin: "4px 0 0 0", fontSize: "0.95rem", lineHeight: "1.4" }}>
                  {card.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

      </section>

      {/* Trending Offers */}
      <section className="section offers-section" aria-labelledby="offers-heading">
        <h2 id="offers-heading" className="section-heading">Trending Offers</h2>
        <div className="offers-container">
          {offers.map((offer) => (
            <div
              key={offer.id || offer.code}
              className="offer-card"
              tabIndex={0}
            >
              {/* Top area */}
              <div className="offer-card-top">
                <div className="offer-logo-circle">
                  <img src={offer.logo} alt={`${offer.code} logo`} />
                </div>

                <div className="offer-details">
                  <div className="offer-code">{offer.code}</div>
                  <div className="offer-tag">
                    {offer.tag ||
                      (offer.percent ? `Flat ${offer.percent}% Off` : "Special Offer")}
                  </div>
                </div>
              </div>
                    
              {/* Description */}
              <div className="offer-description">{offer.desc}</div>
                    
              {/* Book button */}
              <button
                type="button"
                className={`offer-book-button ${animateId === (offer.id || offer.code) ? "copied-anim" : ""}`}
                onClick={() => handleCopy(offer.code, offer.id || offer.code)}
              >
                {copiedId === (offer.id || offer.code) ? "Copied" : "Copy"}
              </button>
            </div>
          ))}

        </div>
      </section>

      {/* Short-Term Rentals */}
      <section className="section shortterm-section" aria-labelledby="shortterm-heading">
        <h2 id="shortterm-heading" className="section-heading">Short-term rentals starting at ₹799</h2>
        <p className="center-text shortterm-description">
          Get convenience, comfort and privacy with Tripy in Chennai rental services.
        </p>
        <div className="shortterm-cards-container">
          {attractions.map((item, idx) => (
            <article key={idx} className="shortterm-card" tabIndex={0}>
              <div
                className="shortterm-card-image"
                style={{
                  backgroundImage: `url(${item.img})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  height: "200px"
                }}
              />
              <div className="shortterm-card-content" style={{ padding: "16px" }}>
                <h3 style={{ marginBottom: "8px" }}>{item.title}</h3>
                <p style={{ margin: 0 }}>{item.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* FAQs */}
      <section className="section faq-section" aria-labelledby="faq-heading">
        <h2 id="faq-heading" className="section-heading">Planning Your Car Rental? Check Our FAQs</h2>
        <div className="faq-grid">
          {faqs.map((faq, idx) => (
            <div
              key={faq.id || idx}
              className={`faq-item ${openFaqIndex === idx ? "open" : ""}`}
              tabIndex={0}
              role="button"
              aria-expanded={openFaqIndex === idx}
              aria-controls={`faq-answer-${idx}`}
              onClick={() => toggleFaq(idx)}
              onKeyDown={(e) => { if(e.key === "Enter" || e.key === " ") toggleFaq(idx); }}
            >
              <div className="faq-question">
                {faq.question}
                <span className={`faq-arrow ${openFaqIndex === idx ? "open" : ""}`} aria-hidden="true">
                  ▼
                </span>
              </div>
              <div
                id={`faq-answer-${idx}`}
                className="faq-answer"
                role="region"
                aria-live="polite"
                aria-hidden={openFaqIndex !== idx}
              >
                {faq.answer}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
