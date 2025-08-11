import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useLocation } from 'react-router-dom';

// Constants for dropdowns
const TRIP_TYPES = ["Hourly", "Outstation", "One Way", "Round Trip"];
const CAR_TYPES = ["SUV", "Sedan", "Hatchback", "Convertible", "Van"];
const SORT_OPTIONS = [
  { value: "", label: "None" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

// LocationAutoSuggest component
function LocationAutoSuggest({ value, onChange }) {
  const [suggestions, setSuggestions] = useState([]);

  const handleSearch = async (search) => {
    if (!search) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await axios.get(
        `http://localhost:8000/api/locations/?search=${encodeURIComponent(search)}`
      );
      setSuggestions(Array.isArray(res.data) ? res.data : res.data?.results || []);
    } catch {
      setSuggestions([]);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    onChange(val);
    handleSearch(val);
  };

  const handleSuggestionClick = (name) => {
    onChange(name);
    setSuggestions([]);
  };

  return (
    <div style={{ position: "relative" }}>
      <input
        type="text"
        value={value || ""}
        onChange={handleInputChange}
        placeholder="Enter location"
        autoComplete="off"
        style={{ width: 120 }}
      />
      {suggestions.length > 0 && (
        <ul
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            backgroundColor: "white",
            border: "1px solid #ccc",
            maxHeight: 150,
            overflowY: "auto",
            zIndex: 1000,
            margin: 0,
            padding: 0,
            listStyle: "none",
          }}
        >
          {suggestions.map((loc) => (
            <li
              key={loc.id}
              onClick={() => handleSuggestionClick(loc.name)}
              style={{ padding: "4px 8px", cursor: "pointer" }}
            >
              {loc.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// EditableText component
function EditableText({ label, value, editing, onStartEdit, children }) {
  return (
    <div
      onClick={() => !editing && onStartEdit()}
      style={{
        marginRight: 24,
        cursor: "pointer",
        whiteSpace: "nowrap",
        userSelect: "none",
        fontWeight: "500",
        color: editing ? "#000" : "#444",
      }}
      title={`Click to edit ${label}`}
    >
      <small style={{ display: "block", fontSize: 11, color: "#888" }}>{label}</small>
      {editing ? children : <span>{value || <i style={{ color: "#aaa" }}>set {label.toLowerCase()}</i>}</span>}
    </div>
  );
}

// CarCard component accepts filters prop
function CarCard({ car, filters }) {
  const stars = [];
  const rating = car.star_rating || 4;
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span key={i} style={{ color: i <= rating ? "#f5a623" : "#ddd", fontSize: 16 }}>
        ★
      </span>
    );
  }
  const navigate = useNavigate();
  const location = useLocation();
  const tempId = location.state?.tempId;

  const handleSelectClick = () => {
    const query = new URLSearchParams({
      trip_type: filters.trip_type,
      pickup_location: filters.pickup_location,
      destination_location: filters.destination_location,
      drop_location: filters.drop_location,
      start_date: filters.start_date
    }).toString();
    navigate(`/cardetail/${car.id}`, { state: { tempId } });
  };

  return (
    <div
      stye={{
        border: "1px solid #ddd",
        borderRadius: 8,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        overflow: "hidden",
        marginBottom: 20,
        width: "100%",
        maxWidth: 280,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#fff",
      }}
    >
      <div style={{ height: 180, width: "100%" }}>
        <img
          src={car.image_url || "https://via.placeholder.com/600x180?text=Car+Photo"}
          alt={car.name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>

      <div style={{ padding: 16, boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 6 }}>
        <h3 style={{ margin: 0, fontSize: 20, fontWeight: "600" }}>{car.name}</h3>

        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, color: "#666" }}>
          {stars}
          <span>({car.review_count || 0} reviews)</span>
        </div>

        <div
          style={{
            backgroundColor: "#e1f5fe",
            color: "#0277bd",
            fontWeight: "600",
            padding: "4px 8px",
            borderRadius: 4,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 14,
            width: "fit-content",
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#0277bd" viewBox="0 0 16 16">
            <path d="M13.485 1.929a.75.75 0 0 1 1.06 1.06l-8.25 8.25a.75.75 0 0 1-1.06 0l-4.25-4.25a.75.75 0 1 1 1.06-1.06L6 9.44l7.485-7.511z" />
          </svg>
          Assured by CartY
        </div>

        <div style={{ fontSize: 14, color: "#444" }}>
          <div>Base Fare: ₹{car.base_fare?.toLocaleString()}</div>
          <div>Taxes: ₹{car.tax?.toLocaleString()}</div>
          <div>Insurance: ₹{car.insurance?.toLocaleString()}</div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
          <strong style={{ fontSize: 16 }}>Total: ₹{car.total?.toLocaleString()}</strong>
          <button
            style={{
              padding: "8px 14px",
              backgroundColor: "#0277bd",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
              fontWeight: 600,
            }}
            onClick={handleSelectClick}
          >
            Select
          </button>
        </div>
      </div>
    </div>
  );
}

// CarList component accepts filters prop and passes to CarCard
function CarList({ cars, loading, error, filters }) {
  return (
    <div
      style={{
        width: "80vw",
        maxWidth: "80vw",
        display: "flex",
        alignItems: "center",
        gap: 12,
        flexWrap: "wrap",
        justifyContent: "center",
      }}
    >
      {loading && <div>Loading cars...</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}
      {!loading && !error && cars.length === 0 && (
        <div style={{ textAlign: "center", fontStyle: "italic", color: "#666" }}>
          No cars found for selected filters.
        </div>
      )}
      {cars.map((car) => (
        <CarCard key={car.id} car={car} filters={filters} />
      ))}
    </div>
  );
}

// AsideCoupons component
function AsideCoupons() {
  const coupons = [
    { code: "SAVE10", desc: "Get 10% off on your next booking" },
    { code: "FREEDRIVER", desc: "Free driver charges for one day" },
    { code: "WEEKEND20", desc: "20% off on weekend trips" },
  ];
  return (
    <aside
      style={{
        width: "20vw",
        maxWidth: 300,
        backgroundColor: "#fff",
        borderRadius: 8,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        padding: 20,
        boxSizing: "border-box",
        height: "fit-content",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        fontFamily: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif",
        fontSize: 14,
      }}
    >
      <h2 style={{ marginTop: 0, fontSize: 18, fontWeight: "700" }}>Discount Coupons</h2>
      {coupons.map((coupon) => (
        <div
          key={coupon.code}
          style={{
            border: "1px solid #0277bd",
            borderRadius: 6,
            padding: "8px 12px",
            backgroundColor: "#e1f5fe",
          }}
        >
          <strong>{coupon.code}</strong> - {coupon.desc}
        </div>
      ))}
    </aside>
  );
}

// Main FilterEditor component
export default function FilterEditor({ initialFilters = {}, onFiltersChange }) {
  const defaultValues = {
    trip_type: "Hourly",
    pickup_location: "",
    destination_location: "",
    drop_location: "",
    start_date: "11-08-2025",
    start_time: "10:00",
    return_date: "",
    return_time: "",
    num_days: 1,
    package: "",
    driver_required: true,
    car_type: "",
    price_min: 0,
    price_max: 10000,
    seats_min: 1,
    sort_price: "",
  };

  const [filters, setFilters] = useState({ ...defaultValues, ...initialFilters });
  const [editingField, setEditingField] = useState(null);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { state } = useLocation();
  const tempId = state?.tempId;
  const trip = filters.trip_type;
  const [searchPayload, setSearchPayload] = useState(null);

  useEffect(() => {
    if (tempId) {
      axios
        .get(`http://localhost:8000/api/booking-temp/${tempId}/`, {
          headers: {
            Authorization: `Token 22d105e5441b4f4319779322913b56b2f75d639d`,
          },
        })
        .then(res => {
          setSearchPayload(res.data);
        })
        .catch(err => {
          console.error("Failed to fetch temp booking", err);
        });
    }
  }, [tempId]);



  useEffect(() => {
    setFilters((prev) => ({ ...defaultValues, ...initialFilters }));
    // eslint-disable-next-line
  }, [JSON.stringify(initialFilters)]);

  useEffect(() => {
    if (typeof onFiltersChange === "function") {
      onFiltersChange(filters);
    }
    // eslint-disable-next-line
  }, [filters]);

  const updateFilter = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const fetchFilteredCars = useCallback(() => {
    if (!filters.trip_type) {
      setCars([]);
      return;
    }
    setLoading(true);
    setError(null);
    const params = {
      trip_type: filters.trip_type,
      pickup_location: filters.pickup_location,
      destination_location: filters.destination_location,
      drop_location: filters.drop_location,
      start_datetime:
        filters.start_date && filters.start_time
          ? `${filters.start_date}T${filters.start_time}`
          : undefined,
      end_datetime:
        filters.return_date && filters.return_time
          ? `${filters.return_date}T${filters.return_time}`
          : undefined,
      num_days: filters.trip_type === "Round Trip" ? filters.num_days : undefined,
      package: filters.trip_type === "Hourly" ? filters.package : undefined,
      driver_required: filters.driver_required,
      car_type: filters.car_type,
      price_min: filters.price_min,
      price_max: filters.price_max,
      seats_min: filters.seats_min,
      ordering:
        filters.sort_price === "price_asc"
          ? "base_fare"
          : filters.sort_price === "price_desc"
          ? "-base_fare"
          : undefined,
    };
    axios
      .get("http://localhost:8000/api/cars/available/", { params })
      .then((res) => setCars(res.data || []))
      .catch(() => {
        setError("Failed to fetch cars. Please try again.");
        setCars([]);
      })
      .finally(() => setLoading(false));
  }, [filters, trip]);

  useEffect(() => {
    const timer = setTimeout(fetchFilteredCars, 500);
    return () => clearTimeout(timer);
  }, [filters, fetchFilteredCars]);

  const startEdit = (field) => setEditingField(field);
  const endEdit = () => setEditingField(null);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        gap: 24,
        padding: 20,
        boxSizing: "border-box",
        backgroundColor: "#f5f5f5",
        alignItems: "flex-start",
      }}
    >
      {/* Main filter and car list */}
      <div
        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, width: "80vw" }}
      >
        {/* Filter bar */}
        <div
          style={{
            width: "100%",
            height: 180,
            maxHeight: 220,
            backgroundColor: "#fafafa",
            borderRadius: 10,
            boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
            padding: "16px 24px",
            display: "flex",
            alignItems: "center",
            overflowX: "auto",
            gap: 24,
            fontFamily: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif",
            fontSize: 14,
            color: "#333",
            userSelect: "none",
            flexWrap: "nowrap",
          }}
        >
          {/* Trip Type */}
          <EditableText
            label="Trip Type"
            value={filters.trip_type}
            editing={editingField === "trip_type"}
            onStartEdit={() => startEdit("trip_type")}
          >
            <select
              autoFocus
              value={filters.trip_type}
              onChange={(e) => updateFilter("trip_type", e.target.value)}
              onBlur={endEdit}
              onKeyDown={(e) => e.key === "Enter" && endEdit()}
            >
              <option value="">Select Trip Type</option>
              {TRIP_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </EditableText>

          {/* Pickup Location */}
          <EditableText
            label="Pickup Location"
            value={filters.pickup_location}
            editing={editingField === "pickup_location"}
            onStartEdit={() => startEdit("pickup_location")}
          >
            <LocationAutoSuggest
              value={filters.pickup_location}
              onChange={(val) => updateFilter("pickup_location", val)}
            />
          </EditableText>

          {/* Destination */}
          {(trip === "Outstation" || trip === "Round Trip") && (
            <EditableText
              label="Destination Location"
              value={filters.destination_location}
              editing={editingField === "destination_location"}
              onStartEdit={() => startEdit("destination_location")}
            >
              <input
                autoFocus
                type="text"
                value={filters.destination_location}
                onChange={(e) => updateFilter("destination_location", e.target.value)}
                onBlur={endEdit}
                onKeyDown={(e) => e.key === "Enter" && endEdit()}
                placeholder="Enter destination"
                style={{ width: 120 }}
              />
            </EditableText>
          )}

          {/* Drop Location */}
          {trip === "One Way" && (
            <EditableText
              label="Drop Location"
              value={filters.drop_location}
              editing={editingField === "drop_location"}
              onStartEdit={() => startEdit("drop_location")}
            >
              <input
                autoFocus
                type="text"
                value={filters.drop_location}
                onChange={(e) => updateFilter("drop_location", e.target.value)}
                onBlur={endEdit}
                onKeyDown={(e) => e.key === "Enter" && endEdit()}
                placeholder="Enter drop"
                style={{ width: 120 }}
              />
            </EditableText>
          )}

          {/* Start Date */}
          <EditableText
            label="Start Date"
            value={filters.start_date}
            editing={editingField === "start_date"}
            onStartEdit={() => startEdit("start_date")}
          >
            <input
              autoFocus
              type="date"
              value={filters.start_date}
              onChange={(e) => updateFilter("start_date", e.target.value)}
              onBlur={endEdit}
              onKeyDown={(e) => e.key === "Enter" && endEdit()}
              style={{ width: 140 }}
            />
          </EditableText>

          {/* Start Time */}
          <EditableText
            label="Start Time"
            value={filters.start_time}
            editing={editingField === "start_time"}
            onStartEdit={() => startEdit("start_time")}
          >
            <input
              autoFocus
              type="time"
              value={filters.start_time}
              onChange={(e) => updateFilter("start_time", e.target.value)}
              onBlur={endEdit}
              onKeyDown={(e) => e.key === "Enter" && endEdit()}
              style={{ width: 110 }}
            />
          </EditableText>

          {/* Return Date & Time */}
          {(trip === "Outstation" || trip === "Round Trip") && (
            <>
              <EditableText
                label="Return Date"
                value={filters.return_date}
                editing={editingField === "return_date"}
                onStartEdit={() => startEdit("return_date")}
              >
                <input
                  autoFocus
                  type="date"
                  value={filters.return_date}
                  onChange={(e) => updateFilter("return_date", e.target.value)}
                  onBlur={endEdit}
                  onKeyDown={(e) => e.key === "Enter" && endEdit()}
                  style={{ width: 140 }}
                />
              </EditableText>
              <EditableText
                label="Return Time"
                value={filters.return_time}
                editing={editingField === "return_time"}
                onStartEdit={() => startEdit("return_time")}
              >
                <input
                  autoFocus
                  type="time"
                  value={filters.return_time}
                  onChange={(e) => updateFilter("return_time", e.target.value)}
                  onBlur={endEdit}
                  onKeyDown={(e) => e.key === "Enter" && endEdit()}
                  style={{ width: 110 }}
                />
              </EditableText>
            </>
          )}

          {/* Number of Days (Round Trip) */}
          {trip === "Round Trip" && (
            <EditableText
              label="No of Days"
              value={filters.num_days}
              editing={editingField === "num_days"}
              onStartEdit={() => startEdit("num_days")}
            >
              <input
                autoFocus
                type="number"
                min={1}
                value={filters.num_days || ""}
                onChange={(e) => updateFilter("num_days", e.target.value)}
                onBlur={endEdit}
                onKeyDown={(e) => e.key === "Enter" && endEdit()}
                style={{ width: 70 }}
              />
            </EditableText>
          )}

          {/* Package (Hourly) */}
          {trip === "Hourly" && (
            <EditableText
              label="Package"
              value={filters.package}
              editing={editingField === "package"}
              onStartEdit={() => startEdit("package")}
            >
              <select
                autoFocus
                value={filters.package}
                onChange={(e) => updateFilter("package", e.target.value)}
                onBlur={endEdit}
                onKeyDown={(e) => e.key === "Enter" && endEdit()}
                style={{ width: 140 }}
              >
                <option value="">Select Package</option>
                <option value="1">Basic (2hr/30km)</option>
                <option value="2">Standard (4hr/60km)</option>
                <option value="3">Premium (8hr/120km)</option>
              </select>
            </EditableText>
          )}

          {/* Driver Required */}
          <EditableText
            label="Driver Required"
            value={filters.driver_required ? "Yes" : "No"}
            editing={editingField === "driver_required"}
            onStartEdit={() => startEdit("driver_required")}
          >
            <select
              autoFocus
              value={filters.driver_required ? "true" : "false"}
              onChange={(e) => updateFilter("driver_required", e.target.value === "true")}
              onBlur={endEdit}
              onKeyDown={(e) => e.key === "Enter" && endEdit()}
              style={{ width: 100 }}
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </EditableText>

          {/* Car Type */}
          <EditableText
            label="Car Type"
            value={filters.car_type}
            editing={editingField === "car_type"}
            onStartEdit={() => startEdit("car_type")}
          >
            <select
              autoFocus
              value={filters.car_type || ""}
              onChange={(e) => updateFilter("car_type", e.target.value)}
              onBlur={endEdit}
              onKeyDown={(e) => e.key === "Enter" && endEdit()}
              style={{ width: 120 }}
            >
              <option value="">All</option>
              {CAR_TYPES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </EditableText>

          {/* Price Range */}
          <EditableText
            label={`Price Range: ₹${filters.price_min} - ₹${filters.price_max}`}
            value={`${filters.price_min}-${filters.price_max}`}
            editing={editingField === "price_range"}
            onStartEdit={() => startEdit("price_range")}
          >
            <div style={{ display: "flex", flexDirection: "column", width: 160 }}>
              <input
                type="range"
                min={0}
                max={filters.price_max >= 10000 ? filters.price_max : 10000}
                value={filters.price_min}
                onChange={(e) => {
                  let val = Number(e.target.value);
                  if (val > filters.price_max) val = filters.price_max;
                  updateFilter("price_min", val);
                }}
                onBlur={endEdit}
              />
              <input
                type="range"
                min={filters.price_min}
                max={10000}
                value={filters.price_max}
                onChange={(e) => {
                  let val = Number(e.target.value);
                  if (val < filters.price_min) val = filters.price_min;
                  updateFilter("price_max", val);
                }}
                onBlur={endEdit}
              />
            </div>
          </EditableText>

          {/* Seats Minimum */}
          <EditableText
            label={`Minimum Seats: ${filters.seats_min}`}
            value={filters.seats_min.toString()}
            editing={editingField === "seats_min"}
            onStartEdit={() => startEdit("seats_min")}
          >
            <select
              autoFocus
              value={filters.seats_min}
              onChange={(e) => updateFilter("seats_min", Number(e.target.value))}
              onBlur={endEdit}
              onKeyDown={(e) => e.key === "Enter" && endEdit()}
              style={{ width: 80 }}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </EditableText>

          {/* Sort By Price */}
          <EditableText
            label="Sort By Price"
            value={SORT_OPTIONS.find((o) => o.value === filters.sort_price)?.label || "None"}
            editing={editingField === "sort_price"}
            onStartEdit={() => startEdit("sort_price")}
          >
            <select
              autoFocus
              value={filters.sort_price}
              onChange={(e) => updateFilter("sort_price", e.target.value)}
              onBlur={endEdit}
              onKeyDown={(e) => e.key === "Enter" && endEdit()}
              style={{ width: 140 }}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </EditableText>
        </div>

        {/* Cars list with filters passed */}
        <CarList cars={cars} loading={loading} error={error} filters={filters} />
      </div>

      {/* Side coupons */}
      <AsideCoupons />
    </div>
  );
}
