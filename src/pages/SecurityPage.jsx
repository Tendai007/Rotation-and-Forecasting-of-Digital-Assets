import { useState, useEffect } from "react";
import { supabase, isSupabaseEnabled } from "../supabase";
import {
  Laptop,
  Tablet,
  Camera,
  ShieldCheck,
  AlertTriangle,
  Wrench,
  Plus,
  X,
  Search,
  ChevronDown,
} from "lucide-react";

// ─── Constants ───────────────────────────────────────────────────────────────

const CATEGORIES = ["all", "laptop", "tablet", "camera"];
const STATUSES = ["all", "available", "checkedOut", "maintenance", "missing"];

const STATUS_META = {
  available:   { label: "Available",    color: "#22c55e" },
  checkedOut:  { label: "Checked Out",  color: "#f59e0b" },
  maintenance: { label: "Maintenance",  color: "#6366f1" },
  missing:     { label: "Missing",      color: "#ef4444" },
};

const CATEGORY_ICONS = {
  laptop:  Laptop,
  tablet:  Tablet,
  camera:  Camera,
};

const STORAGE_KEY = "kibera-security-devices";
const DEFAULT_DEVICES = [
  {
    id: "device-1",
    name: "Samsung Tab A9",
    category: "tablet",
    serialNumber: "SN-1001",
    status: "available",
    assignedTo: null,
    assignedAt: null,
    returnDue: null,
    notes: "Staff tablet for field reporting",
    addedAt: "2026-07-01T00:00:00.000Z",
    lastSeen: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "device-2",
    name: "Dell Latitude 7420",
    category: "laptop",
    serialNumber: "SN-1002",
    status: "checkedOut",
    assignedTo: "Amina Yusuf",
    assignedAt: "2026-07-03T00:00:00.000Z",
    returnDue: "2026-07-10",
    notes: "Loaned for training workshop",
    addedAt: "2026-07-01T00:00:00.000Z",
    lastSeen: "2026-07-03T00:00:00.000Z",
  },
  {
    id: "device-3",
    name: "Sony ZV-E10",
    category: "camera",
    serialNumber: "SN-1003",
    status: "maintenance",
    assignedTo: null,
    assignedAt: null,
    returnDue: null,
    notes: "Lens calibration pending",
    addedAt: "2026-07-02T00:00:00.000Z",
    lastSeen: "2026-07-04T00:00:00.000Z",
  },
];

const readStoredDevices = () => {
  if (typeof window === "undefined") return DEFAULT_DEVICES;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // ignore storage errors and fall back to defaults
  }
  return DEFAULT_DEVICES;
};

const persistDevices = (devices) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(devices));
  } catch {
    // ignore storage errors
  }
};

const getTimestamp = () => new Date().toISOString();

// ─── Helper ──────────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.available;
  return (
    <span
      style={{
        background: meta.color + "22",
        color: meta.color,
        border: `1px solid ${meta.color}44`,
        padding: "2px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      {meta.label}
    </span>
  );
}

// ─── Add Device Modal ─────────────────────────────────────────────────────────

function AddDeviceModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    name: "",
    category: "laptop",
    serialNumber: "",
    notes: "",
  });

  const handle = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async () => {
    if (!form.name.trim()) return;
    await onSave({ ...form, status: "available", assignedTo: null, assignedAt: null, returnDue: null });
    onClose();
  };

  return (
    <Overlay onClose={onClose}>
      <h3 style={{ marginBottom: 20, color: "#f5f0e8" }}>Register New Device</h3>
      <Field label="Device Name">
        <input name="name" value={form.name} onChange={handle} placeholder="e.g. Samsung Tab A9 #2" />
      </Field>
      <Field label="Category">
        <select name="category" value={form.category} onChange={handle}>
          <option value="laptop">Laptop</option>
          <option value="tablet">Tablet</option>
          <option value="camera">Camera</option>
        </select>
      </Field>
      <Field label="Serial Number">
        <input name="serialNumber" value={form.serialNumber} onChange={handle} placeholder="SN-2024-001" />
      </Field>
      <Field label="Notes">
        <textarea name="notes" value={form.notes} onChange={handle} rows={3} placeholder="Any details..." />
      </Field>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
        <Btn ghost onClick={onClose}>Cancel</Btn>
        <Btn onClick={submit}>Save Device</Btn>
      </div>
    </Overlay>
  );
}

// ─── Check Out / Return Modal ─────────────────────────────────────────────────

function CheckoutModal({ device, onClose, onCheckout, onReturn }) {
  const [assignedTo, setAssignedTo] = useState("");
  const [returnDue, setReturnDue] = useState("");
  const isOut = device.status === "checkedOut";

  return (
    <Overlay onClose={onClose}>
      <h3 style={{ marginBottom: 8, color: "#f5f0e8" }}>{device.name}</h3>
      <p style={{ color: "#a09880", marginBottom: 20, fontSize: 13 }}>
        {isOut ? `Currently with: ${device.assignedTo}` : "Mark as checked out to a member"}
      </p>
      {isOut ? (
        <>
          <p style={{ color: "#f5f0e8", marginBottom: 20 }}>
            Return this device and mark it available again?
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn ghost onClick={onClose}>Cancel</Btn>
            <Btn onClick={() => { onReturn(device.id); onClose(); }}>Confirm Return</Btn>
          </div>
        </>
      ) : (
        <>
          <Field label="Assigned To">
            <input value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} placeholder="Member name" />
          </Field>
          <Field label="Return Due (optional)">
            <input type="date" value={returnDue} onChange={(e) => setReturnDue(e.target.value)} />
          </Field>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
            <Btn ghost onClick={onClose}>Cancel</Btn>
            <Btn onClick={() => { if (assignedTo) { onCheckout(device.id, assignedTo, returnDue); onClose(); } }}>
              Check Out
            </Btn>
          </div>
        </>
      )}
    </Overlay>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SecurityPage() {
  const [devices, setDevices] = useState(() => readStoredDevices());
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [checkoutTarget, setCheckoutTarget] = useState(null);
  const [selectedLocationDevice, setSelectedLocationDevice] = useState(null);
  const [locatingDeviceId, setLocatingDeviceId] = useState(null);
  const [locationError, setLocationError] = useState("");

  useEffect(() => {
    persistDevices(devices);
  }, [devices]);

  useEffect(() => {
    if (!isSupabaseEnabled || !supabase) {
      return undefined;
    }

    const loadDevices = async () => {
      const { data, error } = await supabase
        .from('devices')
        .select('*')
        .order('addedAt', { ascending: false });

      if (error || !data) {
        setDevices(readStoredDevices());
        return;
      }
      setDevices(data.length ? data : readStoredDevices());
    };

    loadDevices();
    return undefined;
  }, []);

  // ── Actions ──
  const addDevice = async (data) => {
    const payload = {
      ...data,
      status: 'available',
      assignedTo: null,
      assignedAt: null,
      returnDue: null,
      addedAt: getTimestamp(),
      lastSeen: getTimestamp(),
    };

    if (isSupabaseEnabled && supabase) {
      const { error } = await supabase.from('devices').insert([payload]);
      if (!error) {
        return;
      }
      console.warn('Supabase addDevice failed', error);
    }

    setDevices((prev) => [{ id: `device-${Date.now()}`, ...payload }, ...prev]);
  };

  const checkoutDevice = async (id, assignedTo, returnDue) => {
    const payload = {
      status: 'checkedOut',
      assignedTo,
      assignedAt: getTimestamp(),
      returnDue: returnDue || null,
      lastSeen: getTimestamp(),
    };

    if (isSupabaseEnabled && supabase) {
      const { error } = await supabase.from('devices').update(payload).eq('id', id);
      if (!error) {
        setDevices((prev) => prev.map((device) => (device.id === id ? { ...device, ...payload } : device)));
        return;
      }
      console.warn('Supabase checkoutDevice failed', error);
    }

    setDevices((prev) => prev.map((device) => (device.id === id ? { ...device, ...payload } : device)));
  };

  const returnDevice = async (id) => {
    const payload = {
      status: 'available',
      assignedTo: null,
      assignedAt: null,
      returnDue: null,
      lastSeen: getTimestamp(),
    };

    if (isSupabaseEnabled && supabase) {
      const { error } = await supabase.from('devices').update(payload).eq('id', id);
      if (!error) {
        setDevices((prev) => prev.map((device) => (device.id === id ? { ...device, ...payload } : device)));
        return;
      }
      console.warn('Supabase returnDevice failed', error);
    }

    setDevices((prev) => prev.map((device) => (device.id === id ? { ...device, ...payload } : device)));
  };

  const markStatus = async (id, status) => {
    const payload = { status, lastSeen: getTimestamp() };

    if (isSupabaseEnabled && supabase) {
      const { error } = await supabase.from('devices').update(payload).eq('id', id);
      if (!error) {
        setDevices((prev) => prev.map((device) => (device.id === id ? { ...device, ...payload } : device)));
        return;
      }
      console.warn('Supabase markStatus failed', error);
    }

    setDevices((prev) => prev.map((device) => (device.id === id ? { ...device, ...payload } : device)));
  };

  const updateDeviceLocation = async (id, location) => {
    const payload = { location, lastSeen: getTimestamp() };

    if (isSupabaseEnabled && supabase) {
      const { error } = await supabase.from('devices').update(payload).eq('id', id);
      if (error) {
        console.warn('Supabase updateDeviceLocation failed', error);
      }
    } else {
      setDevices((prev) => prev.map((device) => (device.id === id ? { ...device, ...payload } : device)));
    }

    setSelectedLocationDevice((prev) => (prev && prev.id === id ? { ...prev, ...payload } : prev));
  };

  const locateDevice = (device) => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setLocationError("Location services are not supported in this browser.");
      return;
    }

    setLocationError("");
    setLocatingDeviceId(device.id);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          updatedAt: new Date().toISOString(),
        };

        await updateDeviceLocation(device.id, location);
        setSelectedLocationDevice({ ...device, location });
        setLocatingDeviceId(null);
      },
      () => {
        setLocationError("Location access was denied or unavailable. Please allow browser location permission.");
        setLocatingDeviceId(null);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  // ── Filtered list ──
  const visible = devices.filter((d) => {
    const matchCat = catFilter === "all" || d.category === catFilter;
    const matchStatus = statusFilter === "all" || d.status === statusFilter;
    const matchSearch =
      d.name?.toLowerCase().includes(search.toLowerCase()) ||
      d.serialNumber?.toLowerCase().includes(search.toLowerCase()) ||
      d.assignedTo?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchStatus && matchSearch;
  });

  // ── Summary counts ──
  const total = devices.length;
  const out = devices.filter((d) => d.status === "checkedOut").length;
  const maintenance = devices.filter((d) => d.status === "maintenance").length;
  const missing = devices.filter((d) => d.status === "missing").length;

  const byCategory = (cat) => devices.filter((d) => d.category === cat).length;

  return (
    <div style={{ padding: "24px 28px", fontFamily: "'Space Grotesk', 'IBM Plex Sans', sans-serif", minHeight: "100vh" }}>
      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <h2 style={{ color: "#f5f0e8", margin: 0, fontSize: 22, fontWeight: 700 }}>Digital Device Security</h2>
          <p style={{ color: "#a09880", margin: "4px 0 0", fontSize: 13 }}>
            Track cameras, tablets, and laptops
          </p>
          {!isSupabaseEnabled && (
            <p style={{ color: "#c9a84c", margin: "6px 0 0", fontSize: 12 }}>
              Saving locally in this browser because Supabase is not configured.
            </p>
          )}
        </div>
        <Btn onClick={() => setShowAdd(true)}>
          <Plus size={15} /> Register Device
        </Btn>
      </div>

      {/* ── Summary Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 28 }}>
        <SummaryCard icon={<ShieldCheck size={18} color="#22c55e" />} label="Total Devices" value={total} sub="registered" />
        <SummaryCard icon={<Laptop size={18} color="#a09880" />} label="Laptops" value={byCategory("laptop")} sub="units" />
        <SummaryCard icon={<Tablet size={18} color="#a09880" />} label="Tablets" value={byCategory("tablet")} sub="units" />
        <SummaryCard icon={<Camera size={18} color="#a09880" />} label="Cameras" value={byCategory("camera")} sub="units" />
        <SummaryCard icon={<ChevronDown size={18} color="#f59e0b" />} label="Checked Out" value={out} sub="right now" accent="#f59e0b" />
        <SummaryCard icon={<Wrench size={18} color="#6366f1" />} label="Maintenance" value={maintenance} sub="devices" accent="#6366f1" />
        <SummaryCard icon={<AlertTriangle size={18} color="#ef4444" />} label="Missing" value={missing} sub="devices" accent="#ef4444" />
      </div>

      {/* ── Filters ── */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 18, alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#a09880" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, serial, or member..."
            style={{ width: "100%", paddingLeft: 32, boxSizing: "border-box" }}
          />
        </div>
        <FilterSelect value={catFilter} onChange={setCatFilter} options={CATEGORIES} label="Category" />
        <FilterSelect value={statusFilter} onChange={setStatusFilter} options={STATUSES} label="Status" />
      </div>

      <div style={{ background: "#1a1610", border: "1px solid #2a2520", borderRadius: 12, padding: 16, marginBottom: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 10 }}>
          <div>
            <p style={{ margin: 0, color: "#f5f0e8", fontWeight: 700 }}>Live device location</p>
            <p style={{ margin: "4px 0 0", color: "#a09880", fontSize: 13 }}>
              Use the Locate action to tag a device with its current position and view it on a map.
            </p>
          </div>
          {selectedLocationDevice?.location && (
            <a
              href={`https://www.google.com/maps?q=${selectedLocationDevice.location.lat},${selectedLocationDevice.location.lng}`}
              target="_blank"
              rel="noreferrer"
              style={{ color: "#c9a84c", fontSize: 13, fontWeight: 600, textDecoration: "none" }}
            >
              Open in Google Maps
            </a>
          )}
        </div>
        {locationError && <p style={{ margin: "0 0 10px", color: "#ef4444", fontSize: 13 }}>{locationError}</p>}
        {selectedLocationDevice?.location ? (
          <div style={{ display: "grid", gap: 10 }}>
            <p style={{ margin: 0, color: "#a09880", fontSize: 13 }}>
              {selectedLocationDevice.name} • {selectedLocationDevice.location.lat.toFixed(5)}, {selectedLocationDevice.location.lng.toFixed(5)}
              {selectedLocationDevice.location.accuracy ? ` • accuracy ±${Math.round(selectedLocationDevice.location.accuracy)}m` : ""}
            </p>
            <iframe
              title={`Location map for ${selectedLocationDevice.name}`}
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${selectedLocationDevice.location.lng - 0.01}%2C${selectedLocationDevice.location.lat - 0.01}%2C${selectedLocationDevice.location.lng + 0.01}%2C${selectedLocationDevice.location.lat + 0.01}&layer=mapnik&marker=${selectedLocationDevice.location.lat}%2C${selectedLocationDevice.location.lng}`}
              style={{ width: "100%", height: 240, border: "0", borderRadius: 10 }}
            />
          </div>
        ) : (
          <p style={{ margin: 0, color: "#a09880", fontSize: 13 }}>No position captured yet. Pick a device and tap Locate to pin it.</p>
        )}
      </div>

      {/* ── Device Table ── */}
      <div style={{ overflowX: "auto", borderRadius: 12, border: "1px solid #2a2520" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#1a1610", borderBottom: "1px solid #2a2520" }}>
              {["Device", "Category", "Serial No.", "Status", "Assigned To", "Actions"].map((h) => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: "#a09880", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: 40, textAlign: "center", color: "#a09880" }}>
                  No devices found. Register one above.
                </td>
              </tr>
            ) : (
              visible.map((device, i) => {
                const Icon = CATEGORY_ICONS[device.category] || Laptop;
                return (
                  <tr
                    key={device.id}
                    style={{
                      background: i % 2 === 0 ? "transparent" : "#0f0d0b44",
                      borderBottom: "1px solid #2a252044",
                    }}
                  >
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Icon size={16} color="#c9a84c" />
                        <span style={{ color: "#f5f0e8", fontWeight: 500 }}>{device.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", color: "#a09880", textTransform: "capitalize" }}>
                      {device.category}
                    </td>
                    <td style={{ padding: "12px 16px", color: "#a09880", fontFamily: "'IBM Plex Mono', monospace", fontSize: 12 }}>
                      {device.serialNumber || "—"}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <StatusBadge status={device.status} />
                    </td>
                    <td style={{ padding: "12px 16px", color: device.assignedTo ? "#f5f0e8" : "#a09880" }}>
                      {device.assignedTo || "—"}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <ActionBtn onClick={() => locateDevice(device)} disabled={locatingDeviceId === device.id}>
                          {locatingDeviceId === device.id ? "Locating..." : "Locate"}
                        </ActionBtn>
                        {/* Checkout / Return */}
                        {(device.status === "available" || device.status === "checkedOut") && (
                          <ActionBtn onClick={() => setCheckoutTarget(device)}>
                            {device.status === "checkedOut" ? "Return" : "Check Out"}
                          </ActionBtn>
                        )}
                        {/* Mark maintenance */}
                        {device.status !== "maintenance" && device.status !== "checkedOut" && (
                          <ActionBtn ghost onClick={() => markStatus(device.id, "maintenance")}>
                            Maintenance
                          </ActionBtn>
                        )}
                        {/* Back to available from maintenance */}
                        {device.status === "maintenance" && (
                          <ActionBtn onClick={() => markStatus(device.id, "available")}>
                            Mark Ready
                          </ActionBtn>
                        )}
                        {/* Mark missing */}
                        {device.status !== "missing" && (
                          <ActionBtn danger onClick={() => markStatus(device.id, "missing")}>
                            Missing
                          </ActionBtn>
                        )}
                        {/* Recover from missing */}
                        {device.status === "missing" && (
                          <ActionBtn onClick={() => markStatus(device.id, "available")}>
                            Recovered
                          </ActionBtn>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Modals ── */}
      {showAdd && <AddDeviceModal onClose={() => setShowAdd(false)} onSave={addDevice} />}
      {checkoutTarget && (
        <CheckoutModal
          device={checkoutTarget}
          onClose={() => setCheckoutTarget(null)}
          onCheckout={checkoutDevice}
          onReturn={returnDevice}
        />
      )}
    </div>
  );
}

// ─── Small shared components ──────────────────────────────────────────────────

function SummaryCard({ icon, label, value, sub, accent = "#c9a84c" }) {
  return (
    <div style={{ background: "#1a1610", border: "1px solid #2a2520", borderRadius: 12, padding: "16px 18px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{ margin: 0, color: "#a09880", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
          <p style={{ margin: "6px 0 2px", color: "#f5f0e8", fontSize: 26, fontWeight: 700 }}>{value}</p>
          <p style={{ margin: 0, color: "#a09880", fontSize: 12 }}>{sub}</p>
        </div>
        <div style={{ background: accent + "18", borderRadius: 8, padding: 8 }}>{icon}</div>
      </div>
    </div>
  );
}

function Overlay({ onClose, children }) {
  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "#000000bb", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: "#1a1610", border: "1px solid #2a2520", borderRadius: 16, padding: "28px 24px", width: "100%", maxWidth: 440, position: "relative" }}
      >
        <button onClick={onClose} style={{ position: "absolute", top: 14, right: 14, background: "none", border: "none", cursor: "pointer", color: "#a09880" }}>
          <X size={18} />
        </button>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", color: "#a09880", fontSize: 12, fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </label>
      <style>{`
        input, select, textarea {
          width: 100%; background: #0f0d0b; border: 1px solid #2a2520;
          color: #f5f0e8; border-radius: 8px; padding: 10px 12px;
          font-size: 14px; font-family: inherit; box-sizing: border-box;
          outline: none;
        }
        input:focus, select:focus, textarea:focus { border-color: #c9a84c; }
        textarea { resize: vertical; }
      `}</style>
      {children}
    </div>
  );
}

function FilterSelect({ value, onChange, options, label }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ background: "#1a1610", border: "1px solid #2a2520", color: "#f5f0e8", borderRadius: 8, padding: "9px 14px", fontSize: 13, fontFamily: "inherit" }}
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o === "all" ? `All ${label}s` : o.charAt(0).toUpperCase() + o.slice(1).replace("checkedOut", "Checked Out")}
        </option>
      ))}
    </select>
  );
}

function Btn({ children, onClick, ghost }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: ghost ? "transparent" : "#c9a84c",
        color: ghost ? "#a09880" : "#0f0d0b",
        border: ghost ? "1px solid #2a2520" : "none",
        borderRadius: 8,
        padding: "9px 16px",
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 6,
        fontFamily: "inherit",
      }}
    >
      {children}
    </button>
  );
}

function ActionBtn({ children, onClick, ghost, danger, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: danger ? "#ef444422" : ghost ? "transparent" : "#c9a84c22",
        color: danger ? "#ef4444" : ghost ? "#a09880" : "#c9a84c",
        border: `1px solid ${danger ? "#ef444444" : ghost ? "#2a2520" : "#c9a84c44"}`,
        borderRadius: 6,
        padding: "5px 10px",
        fontSize: 12,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "inherit",
        whiteSpace: "nowrap",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {children}
    </button>
  );
}
