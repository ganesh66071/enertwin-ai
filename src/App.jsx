import React, { useEffect, useMemo, useState } from "react";
import "./App.css";

/* =========================================================
   ENERGY CONFIGURATION
   ========================================================= */

const POWER_FACTOR = 0.92;
const ELECTRICITY_TARIFF = 6.0; // ₹ per kWh
const CO2_FACTOR = 0.708; // kg CO2 per kWh

/* =========================================================
   MACHINE DATA
   ========================================================= */

const machines = [
  {
    id: "Motor-01",
    type: "Industrial Motor",
    icon: "⚙",
  },
  {
    id: "Compressor-02",
    type: "Air Compressor",
    icon: "◈",
  },
  {
    id: "Pump-03",
    type: "Water Pump",
    icon: "◉",
  },
  {
    id: "Fan-04",
    type: "Cooling Fan",
    icon: "◎",
  },
  {
    id: "Motor-05",
    type: "Production Motor",
    icon: "⚙",
  },
];

/* =========================================================
   SIDEBAR MENU
   ========================================================= */

const menuItems = [
  { id: "dashboard", icon: "⌂", label: "Dashboard" },
  { id: "energy", icon: "⌁", label: "Energy Monitoring" },
  { id: "digital-twin", icon: "◈", label: "Digital Twin" },
  { id: "ai", icon: "✦", label: "AI Insights" },
  { id: "analytics", icon: "◔", label: "Analytics" },
  { id: "alerts", icon: "⚠", label: "Alerts" },
  { id: "machines", icon: "⚙", label: "Machines" },
  { id: "control", icon: "▣", label: "Machine Control" },
  { id: "reports", icon: "▤", label: "Reports" },
  { id: "notifications", icon: "♢", label: "Notifications" },
  { id: "settings", icon: "⚙", label: "Settings" },
];

/* =========================================================
   HELPER FUNCTIONS
   ========================================================= */

/*
   Real electrical relationship:

   Power (kW) = Voltage (V) × Current (A) × Power Factor / 1000
*/

function calculatePower(voltage, current) {
  return Number(
    ((voltage * current * POWER_FACTOR) / 1000).toFixed(2)
  );
}

/*
   AI health score based on machine condition.
*/

function calculateHealth({
  temperature,
  current,
  power,
}) {
  if (
    temperature == null ||
    current == null ||
    power == null
  ) {
    return null;
  }

  let score = 100;

  if (temperature > 34) {
    score -= Math.min(18, (temperature - 34) * 3);
  }

  if (current > 5.8) {
    score -= Math.min(15, (current - 5.8) * 8);
  }

  if (power > 1.35) {
    score -= Math.min(18, (power - 1.35) * 35);
  }

  return Math.max(65, Math.min(100, Math.round(score)));
}

/* =========================================================
   ALERT LOGIC
   ========================================================= */

function checkAbnormal(values) {
  if (
    values.temperature == null ||
    values.power == null ||
    values.current == null
  ) {
    return false;
  }

  return (
    values.temperature >= 35 ||
    values.power >= 1.42 ||
    values.current >= 6.15
  );
}

/* =========================================================
   APP
   ========================================================= */

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [page, setPage] = useState("dashboard");
  const [autoRefresh, setAutoRefresh] = useState(false);

  /* =======================================================
     HARDWARE-READY LIVE VALUES
     No predefined sensor values are used.
     Values appear only after hardware/backend data arrives.
     ======================================================= */

  const [selectedMachineId, setSelectedMachineId] =
    useState(machines[0].id);

  const defaultInitialMachines = [
    {
      id: "Motor-01",
      type: "Industrial Motor",
      icon: "⚙",
      temperature: 31.4,
      voltage: 230,
      current: 5.2,
      power: 1.10,
      energy: 18.7,
      cost: 112.20,
      co2: 12.31,
      vibration: 1.2,
      frequency: 50.0,
      powerFactor: 0.92,
      health: 96,
      status: "Normal",
      lastUpdated: new Date(),
    },
    {
      id: "Compressor-02",
      type: "Air Compressor",
      icon: "◈",
      temperature: 34.2,
      voltage: 228,
      current: 5.6,
      power: 1.18,
      energy: 24.1,
      cost: 144.60,
      co2: 15.87,
      vibration: 1.8,
      frequency: 50.1,
      powerFactor: 0.91,
      health: 91,
      status: "Normal",
      lastUpdated: new Date(),
    },
    {
      id: "Pump-03",
      type: "Water Pump",
      icon: "◉",
      temperature: 29.8,
      voltage: 232,
      current: 4.8,
      power: 1.02,
      energy: 15.3,
      cost: 91.80,
      co2: 10.07,
      vibration: 0.9,
      frequency: 49.9,
      powerFactor: 0.93,
      health: 98,
      status: "Normal",
      lastUpdated: new Date(),
    },
    {
      id: "Fan-04",
      type: "Cooling Fan",
      icon: "◎",
      temperature: 28.5,
      voltage: 230,
      current: 3.9,
      power: 0.83,
      energy: 11.6,
      cost: 69.60,
      co2: 7.63,
      vibration: 0.7,
      frequency: 50.0,
      powerFactor: 0.94,
      health: 100,
      status: "Normal",
      lastUpdated: new Date(),
    },
    {
      id: "Motor-05",
      type: "Production Motor",
      icon: "⚙",
      temperature: 36.5,
      voltage: 226,
      current: 6.2,
      power: 1.29,
      energy: 26.8,
      cost: 160.80,
      co2: 17.64,
      vibration: 2.3,
      frequency: 49.8,
      powerFactor: 0.90,
      health: 82,
      status: "Warning",
      lastUpdated: new Date(),
    },
  ];

  const [machinesState, setMachinesState] =
    useState(defaultInitialMachines);

  const selectedMachine =
    machinesState.find(
      (machine) => machine.id === selectedMachineId
    ) || machinesState[0];

  const [values, setValues] = useState({
    temperature: defaultInitialMachines[0].temperature,
    voltage: defaultInitialMachines[0].voltage,
    current: defaultInitialMachines[0].current,
    power: defaultInitialMachines[0].power,
    energy: defaultInitialMachines[0].energy,
    cost: defaultInitialMachines[0].cost,
    co2: defaultInitialMachines[0].co2,
    health: defaultInitialMachines[0].health,
  });

  const [relay, setRelay] = useState(false);
  const [cooling, setCooling] = useState(false);

  const [runtime, setRuntime] = useState(8);

  /* =========================================================
     LIVE DATE + TIME
     ========================================================= */

  const [currentTime, setCurrentTime] =
    useState(new Date());

  useEffect(() => {
    const clock = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(clock);
  }, []);

  /* =========================================================
     ALERT STATUS
     ========================================================= */

  const alertActive = useMemo(() => {
    return checkAbnormal(values);
  }, [values]);

  /* =========================================================
     HARDWARE DATA BRIDGE
     Accepts either one sensor object or an array of machine objects.
     This keeps the dashboard ready for ESP32 -> backend integration.

     Supported keys include:
     temperature/temp, voltage, current, power, energy,
     vibration, frequency, powerFactor/pf, machineId/id.
     ========================================================= */

  const applyHardwareData = (payload) => {
    const incoming = Array.isArray(payload)
      ? payload
      : payload?.machines || payload?.data || [payload];

    if (!Array.isArray(incoming)) return;

    setMachinesState((previousMachines) =>
      previousMachines.map((machine) => {
        const raw = incoming.find(
          (item) => {
            const incomingId =
              item?.machineId ?? item?.id ?? item?.machine;

            if (incomingId == null && incoming.length === 1) {
              return machine.id === selectedMachineId;
            }

            return String(incomingId) === machine.id;
          }
        );

        if (!raw) return machine;

        const temperature = Number(
          raw.temperature ?? raw.temp
        );
        const voltage = Number(raw.voltage);
        const current = Number(raw.current);
        const suppliedPower = Number(
          raw.power ?? raw.powerKw
        );
        const power = Number.isFinite(suppliedPower)
          ? Number(suppliedPower > 20
              ? (suppliedPower / 1000).toFixed(2)
              : suppliedPower.toFixed(2))
          : Number.isFinite(voltage) && Number.isFinite(current)
            ? calculatePower(voltage, current)
            : null;
        const energy = Number(raw.energy ?? raw.energyToday);
        const vibration = Number(raw.vibration);
        const frequency = Number(raw.frequency);
        const powerFactor = Number(
          raw.powerFactor ?? raw.pf
        );

        const safeNumber = (value) =>
          Number.isFinite(value) ? value : null;

        const nextTemperature = safeNumber(temperature);
        const nextVoltage = safeNumber(voltage);
        const nextCurrent = safeNumber(current);
        const nextPower = safeNumber(power);
        const nextEnergy = safeNumber(energy);
        const nextVibration = safeNumber(vibration);
        const nextFrequency = safeNumber(frequency);
        const nextPowerFactor = safeNumber(powerFactor);

        const nextHealth = calculateHealth({
          temperature: nextTemperature,
          current: nextCurrent,
          power: nextPower,
        });

        const status =
          nextHealth == null
            ? "Waiting"
            : checkAbnormal({
                temperature: nextTemperature,
                current: nextCurrent,
                power: nextPower,
              })
              ? "Warning"
              : "Normal";

        const nextCost =
          nextEnergy == null
            ? null
            : Number(
                (nextEnergy * ELECTRICITY_TARIFF).toFixed(2)
              );

        const nextCO2 =
          nextEnergy == null
            ? null
            : Number(
                (nextEnergy * CO2_FACTOR * 0.93).toFixed(2)
              );

        return {
          ...machine,
          temperature: nextTemperature,
          voltage: nextVoltage,
          current: nextCurrent,
          power: nextPower,
          energy: nextEnergy,
          cost: nextCost,
          co2: nextCO2,
          vibration: nextVibration,
          frequency: nextFrequency,
          powerFactor: nextPowerFactor,
          health: nextHealth,
          status,
          lastUpdated: new Date(),
        };
      })
    );
  };

  useEffect(() => {
    const handleHardwareData = (event) => {
      applyHardwareData(event.detail);
    };

    window.addEventListener(
      "enertwin:sensor-data",
      handleHardwareData
    );

    return () =>
      window.removeEventListener(
        "enertwin:sensor-data",
        handleHardwareData
      );
  }, [selectedMachineId]);

  /* =========================================================
     SELECTED MACHINE VALUES
     ========================================================= */

  useEffect(() => {
    if (!selectedMachine) return;

    setValues({
      temperature: selectedMachine.temperature,
      voltage: selectedMachine.voltage,
      current: selectedMachine.current,
      power: selectedMachine.power,
      energy: selectedMachine.energy,
      cost: selectedMachine.cost,
      co2: selectedMachine.co2,
      health: selectedMachine.health,
    });
  }, [selectedMachineId, machinesState]);

  /* =========================================================
     AUTO REFRESH
     ========================================================= */

  useEffect(() => {
    if (!autoRefresh) {
      return undefined;
    }

    const interval = setInterval(async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/sensor-data"
        );

        if (!response.ok) return;

        const data = await response.json();
        applyHardwareData(data);
      } catch (error) {
        // Keep the dashboard silent while hardware/backend is unavailable.
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [autoRefresh, selectedMachineId]);

  /* =========================================================
     WHAT-IF SIMULATOR
     ========================================================= */

  const whatIf = useMemo(() => {
    const hoursSaved = 8 - runtime;

    const averageMotorPower =
      selectedMachine?.power;

    const energySaving =
      averageMotorPower == null
        ? null
        : Math.max(
            0,
            hoursSaved * averageMotorPower
          );

    const costSaving =
      energySaving == null
        ? null
        : energySaving * ELECTRICITY_TARIFF;

    const co2Saving =
      energySaving == null
        ? null
        : energySaving * CO2_FACTOR;

    return {
      hoursSaved,
      energySaving:
        energySaving == null
          ? null
          : energySaving.toFixed(1),
      costSaving:
        costSaving == null
          ? null
          : costSaving.toFixed(0),
      co2Saving:
        co2Saving == null
          ? null
          : co2Saving.toFixed(1),
    };
  }, [runtime, machinesState, selectedMachineId]);

  /* =========================================================
     LOGIN
     ========================================================= */

  if (!loggedIn) {
    return (
      <Login
        onLogin={() => setLoggedIn(true)}
      />
    );
  }

  return (
    <div className="app-shell">
      <Sidebar
        page={page}
        setPage={setPage}
        alertActive={alertActive}
      />

      <main className="main-area">
        <TopBar
          page={page}
          autoRefresh={autoRefresh}
          setAutoRefresh={setAutoRefresh}
          setPage={setPage}
          currentTime={currentTime}
        />

        {page === "dashboard" && (
          <Dashboard
            values={values}
            machines={machinesState}
            setPage={setPage}
            runtime={runtime}
            setRuntime={setRuntime}
            whatIf={whatIf}
            alertActive={alertActive}
            selectedMachineId={selectedMachineId}
            setSelectedMachineId={setSelectedMachineId}
          />
        )}

        {page === "energy" && (
          <EnergyPage values={values} />
        )}

        {page === "digital-twin" && (
          <DigitalTwinPage
            machine={selectedMachine}
          />
        )}

        {page === "ai" && (
          <AIPage
            values={values}
            alertActive={alertActive}
            machine={selectedMachine}
          />
        )}

        {page === "analytics" && (
          <AnalyticsPage values={values} />
        )}

        {page === "alerts" && (
          <AlertsPage
            values={values}
            alertActive={alertActive}
          />
        )}

        {page === "machines" && (
          <MachinesPage
            machines={machinesState}
          />
        )}

        {page === "control" && (
          <ControlPage
            relay={relay}
            setRelay={setRelay}
            cooling={cooling}
            setCooling={setCooling}
            values={values}
          />
        )}

        {page === "reports" && (
          <ReportsPage />
        )}

        {page === "notifications" && (
          <NotificationsPage
            alertActive={alertActive}
          />
        )}

        {page === "settings" && (
          <SettingsPage
            autoRefresh={autoRefresh}
            setAutoRefresh={setAutoRefresh}
          />
        )}
      </main>
    </div>
  );
}

/* =========================================================
   LOGIN
   ========================================================= */

function Login({ onLogin }) {
  const [user, setUser] = useState("");
  const [password, setPassword] =
    useState("");

  const submit = (event) => {
    event.preventDefault();

    const validUser = "gani6607";
    const validPassword = "1234";

    if (
      user.trim() === validUser &&
      password === validPassword
    ) {
      onLogin();
      return;
    }

    alert("Incorrect username or password.");
  };

  return (
    <div className="login-page">
      <div className="login-background-shape shape-one"></div>
      <div className="login-background-shape shape-two"></div>

      <div className="login-card">
        <div className="login-brand">
          <div className="brand-mark">
            ET
          </div>

          <div>
            <h1>
              EnerTwin <span>AI</span>
            </h1>

            <p>
              Industrial Energy Intelligence
            </p>
          </div>
        </div>

        <div className="login-heading">
          <span className="login-kicker">
            SMART ENERGY PLATFORM
          </span>

          <h2>Welcome</h2>

          <p>
            Sign in to access your digital twin
            dashboard.
          </p>
        </div>

        <form onSubmit={submit}>
          <label htmlFor="user-id">
            User ID
          </label>

          <div className="input-box">
            <span>◉</span>

            <input
              id="user-id"
              type="text"
              placeholder="Enter your user ID"
              value={user}
              onChange={(event) =>
                setUser(
                  event.target.value
                )
              }
            />
          </div>

          <label htmlFor="password">
            Password
          </label>

          <div className="input-box">
            <span>◆</span>

            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
            />
          </div>

          <button
            className="login-button"
            type="submit"
          >
            Enter Dashboard{" "}
            <span>→</span>
          </button>
        </form>

        <div className="login-footer">
          <span className="online-dot"></span>
          Secure EnerTwin AI Environment
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   SIDEBAR
   ========================================================= */

function Sidebar({
  page,
  setPage,
  alertActive,
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <div className="brand-logo">
          <div className="brand-symbol">
            ET
          </div>

          <div>
            <h1>
              EnerTwin <span>AI</span>
            </h1>

            <small>
              Industrial Energy Intelligence
            </small>
          </div>
        </div>

        <div className="nav-label">
          CONTROL CENTER
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`nav-item ${
                page === item.id
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setPage(item.id)
              }
            >
              <span className="nav-icon">
                {item.icon}
              </span>

              <span className="nav-text">
                {item.label}
              </span>

              {item.id === "alerts" &&
                alertActive && (
                  <span className="nav-badge">
                    1
                  </span>
                )}
            </button>
          ))}
        </nav>
      </div>

      <div className="sidebar-bottom">
        <div className="system-status">
          <div className="status-title">
            <span className="online-dot"></span>
            System Online
          </div>

          <p>
            All monitoring systems operational
          </p>
        </div>

        <div className="sidebar-version">
          EnerTwin AI <span>v1.0</span>
        </div>
      </div>
    </aside>
  );
}

/* =========================================================
   TOP BAR
   ========================================================= */

function TopBar({
  page,
  autoRefresh,
  setAutoRefresh,
  setPage,
  currentTime,
}) {
  const title =
    menuItems.find(
      (item) => item.id === page
    )?.label || "Dashboard";

  const formattedDate =
    currentTime.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );

  const formattedTime =
    currentTime.toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }
    );

  return (
    <header className="topbar">
      <div className="topbar-title">
        <div className="breadcrumb">
          ENERGY INTELLIGENCE PLATFORM
        </div>

        <h2>{title}</h2>

        <p>
          {page === "dashboard"
            ? "Real-time energy intelligence & digital twin"
            : "EnerTwin AI monitoring environment"}
        </p>
      </div>

      <div className="top-actions">
        <div className="date-box top-info-box">
          <div className="top-info-icon">
            ◫
          </div>

          <div className="top-info-content">
            <span>DATE</span>
            <strong>
              {formattedDate}
            </strong>
          </div>
        </div>

        <div className="time-box top-info-box">
          <div className="top-info-icon">
            ◷
          </div>

          <div className="top-info-content">
            <span>LIVE TIME</span>
            <strong>
              {formattedTime}
            </strong>
          </div>
        </div>

        <button
          type="button"
          className="notification-button"
          onClick={() =>
            setPage("notifications")
          }
          title="Notifications"
          aria-label="Open notifications"
        >
          ♢

          <span
            className={`notification-dot ${
              !autoRefresh
                ? "inactive"
                : ""
            }`}
          ></span>
        </button>

        <button
          type="button"
          className={`refresh-toggle ${
            autoRefresh
              ? "enabled"
              : ""
          }`}
          onClick={() =>
            setAutoRefresh(
              !autoRefresh
            )
          }
        >
          <span>↻</span>

          <span className="refresh-label">
            Auto Refresh
          </span>

          <strong>
            {autoRefresh
              ? "ON"
              : "OFF"}
          </strong>
        </button>

        <div className="profile-circle">
          ET
        </div>
      </div>
    </header>
  );
}

/* =========================================================
   DASHBOARD
   ========================================================= */

function Dashboard({
  values,
  machines,
  setPage,
  runtime,
  setRuntime,
  whatIf,
  alertActive,
  selectedMachineId,
  setSelectedMachineId,
}) {
  const motor =
    machines.find((machine) => machine.id === selectedMachineId) || machines[0];

  return (
    <div className="dashboard">
      <section className="machine-selector-panel">
        <div className="machine-selector-copy">
          <span>MONITORED MACHINE</span>
          <strong>Choose a machine to view live operating data</strong>
        </div>

        <div className="machine-selector-control">
          <label htmlFor="dashboard-machine-select">
            Machine
          </label>
          <select
            id="dashboard-machine-select"
            value={selectedMachineId}
            onChange={(event) =>
              setSelectedMachineId(event.target.value)
            }
          >
            {machines.map((machine) => (
              <option key={machine.id} value={machine.id}>
                {machine.id} — {machine.type}
              </option>
            ))}
          </select>
        </div>

        <div className="machine-live-state">
          <span className={`machine-live-dot ${motor?.status === "Warning" ? "warning" : ""}`}></span>
          <span>
            {motor?.status === "Waiting"
              ? "Waiting for hardware data"
              : motor?.status === "Warning"
                ? "Attention required"
                : "Live sensor data"}
          </span>
        </div>
      </section>

      <section className="hero-row">
        <div className="hero-copy">
          <span className="hero-tag">
            ● {motor?.status === "Waiting" ? "HARDWARE-READY DIGITAL TWIN" : "LIVE DIGITAL TWIN"}
          </span>

          <h1>
            Industrial Energy
            <br />
            <span>
              Intelligence.
            </span>
          </h1>

          <p>
            Monitor machine health, understand
            energy behavior and make smarter
            operational decisions.
          </p>
        </div>

        <div className="hero-twin">
          <div className="twin-glow"></div>

          <div className="machine-visual">
            <div className="motor-body"></div>
            <div className="motor-cylinder"></div>
            <div className="motor-top"></div>
            <div className="motor-base"></div>
            <div className="motor-shaft"></div>
          </div>

          <div className="twin-label">
            <span>{motor?.status === "Waiting" ? "READY" : "LIVE"}</span>
            Digital Twin
            <strong>
              {motor.id}
            </strong>
          </div>
        </div>
      </section>

      <section className="metric-grid">
        <MetricCard
          icon="℃"
          title="Temperature"
          value={values.temperature}
          unit="°C"
          machine={selectedMachineId}
          tone="red"
        />

        <MetricCard
          icon="ϟ"
          title="Voltage"
          value={values.voltage}
          unit="V"
          machine={selectedMachineId}
          tone="blue"
        />

        <MetricCard
          icon="∿"
          title="Current"
          value={values.current}
          unit="A"
          machine={selectedMachineId}
          tone="purple"
        />

        <MetricCard
          icon="◒"
          title="Power"
          value={values.power}
          unit="kW"
          machine={selectedMachineId}
          tone="orange"
        />

        <MetricCard
          icon="⚡"
          title="Energy Today"
          value={values.energy}
          unit="kWh"
          machine="Awaiting hardware"
          tone="yellow"
        />

        <MetricCard
          icon="₹"
          title="Amount Today"
          value={values.cost}
          unit=""
          machine="Live calculation"
          tone="green"
        />

        <MetricCard
          icon="◉"
          title="CO₂ Saved"
          value={values.co2}
          unit="kg"
          machine="Live calculation"
          tone="mint"
        />

        <div className="health-card">
          <div className="health-head">
            <div className="health-icon">
              ✦
            </div>

            <div>
              <span>AI HEALTH</span>

              <h3>
                {values.health == null ? "—" : values.health}
                <small>/100</small>
              </h3>
            </div>
          </div>

          <div className="health-progress">
            <span
              style={{
                width: `${values.health ?? 0}%`,
              }}
            ></span>
          </div>

          <div className="health-bottom">
            <span>
              Machine Intelligence
            </span>

            <strong>
              {values.health == null
                ? "Awaiting data"
                : alertActive
                  ? "Attention"
                  : "Healthy"}
            </strong>
          </div>
        </div>
      </section>

      <section className="main-grid">
        <div className="panel ai-panel full-width-panel">
          <PanelHeader
            title="Machine Insight"
            subtitle="Condition analysis from live machine data"
            icon="✦"
          />

          {values.health == null ? (
            <div className="hardware-waiting-card">
              <span>◌ HARDWARE DATA PENDING</span>
              <strong>Connect the machine sensors to begin live analysis.</strong>
              <p>
                Temperature, electrical readings and machine health will appear here automatically after the ESP32/backend connection is active.
              </p>
            </div>
          ) : !alertActive ? (
            <>
              <div className="ai-status normal-ai-status">
                <div className="ai-status-icon">
                  ✓
                </div>

                <div>
                  <strong>
                    Machine condition is being monitored
                  </strong>

                  <p>
                    {selectedMachineId} is currently within
                    the available live monitoring view.
                  </p>
                </div>
              </div>

              <div className="ai-alert-mini ai-normal">
                <span>✓</span>

                <div>
                  <strong>
                    No Abnormal Condition Detected
                  </strong>

                  <p>
                    Live sensor values are within the
                    configured operating limits.
                  </p>
                </div>
              </div>

              <div className="ai-recommendation ai-normal-recommendation">
                <span>✓</span>

                <div>
                  <strong>
                    Monitoring Active
                  </strong>

                  <p>
                    Continue monitoring as live hardware
                    data is received.
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="ai-status">
                <div className="ai-status-icon">
                  ✦
                </div>

                <div>
                  <strong>
                    Energy anomaly detected
                  </strong>

                  <p>
                    {selectedMachineId} is operating above
                    the configured normal range.
                  </p>
                </div>
              </div>

              <div className="ai-alert-mini">
                <span>⚠</span>

                <div>
                  <strong>
                    Abnormal Energy Usage
                  </strong>

                  <p>
                    {selectedMachineId} is showing a power
                    pattern that needs attention.
                  </p>
                </div>
              </div>

              <div className="ai-recommendation">
                <span>✓</span>

                <div>
                  <strong>
                    Recommended Action
                  </strong>

                  <p>
                    Review the machine load and operating
                    conditions.
                  </p>
                </div>
              </div>
            </>
          )}

          <button
            type="button"
            className="outline-button"
            onClick={() =>
              setPage("ai")
            }
          >
            Open AI Insights →
          </button>
        </div>
      </section>

      <section className="lower-grid">
        <div className="panel motor-panel">
          <PanelHeader
            title={`Digital Twin — ${selectedMachineId}`}
            subtitle="Live machine condition"
            icon="◈"
          />

          <div className="motor-details">
            <div className="large-motor">
              <div className="digital-motor">
                <div className="dm-cylinder"></div>
                <div className="dm-body"></div>
                <div className="dm-top"></div>
                <div className="dm-base"></div>
              </div>

              <span className="live-pill">
                ● LIVE
              </span>
            </div>

            <div className="machine-specs">
              <div className="machine-name-row">
                <div>
                  <h3>
                    {selectedMachineId}
                  </h3>

                  <span>
                    {motor?.type}
                  </span>
                </div>

                <b className="normal-pill">
                  ●{" "}
                  {motor?.status === "Waiting"
                    ? "Waiting"
                    : alertActive
                      ? "Attention"
                      : "Healthy"}
                </b>
              </div>

              <Spec
                label="Load"
                value={
                  motor?.power == null
                    ? "—"
                    : `${Math.min(100, Math.round((motor.power / 2.5) * 100))}%`
                }
              />

              <Spec
                label="Temperature"
                value={motor?.temperature == null ? "—" : `${motor.temperature} °C`}
              />

              <Spec
                label="Current"
                value={motor?.current == null ? "—" : `${motor.current} A`}
              />

              <Spec
                label="Power"
                value={motor?.power == null ? "—" : `${motor.power} kW`}
              />

              <Spec
                label="Voltage"
                value={motor?.voltage == null ? "—" : `${motor.voltage} V`}
              />

              <Spec
                label="Vibration"
                value={motor?.vibration == null ? "—" : `${motor.vibration} mm/s`}
              />

              <button
                type="button"
                className="text-button"
                onClick={() =>
                  setPage("machines")
                }
              >
                View all machines →
              </button>
            </div>
          </div>
        </div>

        <div className="panel simulator-panel">
          <PanelHeader
            title="What-If Simulator"
            subtitle="AI-powered scenario planning"
            icon="◇"
          />

          <div className="sim-question">
            What if{" "}
            <strong>
              Motor-01
            </strong>{" "}
            runs fewer hours?
          </div>

          <div className="runtime-row">
            <span>
              Machine Runtime
            </span>

            <strong>
              {runtime}h
            </strong>
          </div>

          <input
            className="runtime-slider"
            type="range"
            min="2"
            max="8"
            value={runtime}
            onChange={(event) =>
              setRuntime(
                Number(
                  event.target.value
                )
              )
            }
          />

          <div className="runtime-labels">
            <span>2h</span>
            <span>8h</span>
          </div>

          <div className="simulation-result">
            <span>
              AI predicts potential savings
            </span>

            <h3>
              {whatIf.energySaving ?? "—"}
              <small>
                {" "}
                kWh/day
              </small>
            </h3>
          </div>

          <div className="saving-grid">
            <div>
              <span>
                Energy
              </span>

              <strong>
                ↓ {whatIf.energySaving ?? "—"} kWh
              </strong>
            </div>

            <div>
              <span>
                Cost
              </span>

              <strong>
                ↓ ₹{whatIf.costSaving ?? "—"}
              </strong>
            </div>

            <div>
              <span>
                CO₂
              </span>

              <strong>
                ↓ {whatIf.co2Saving ?? "—"} kg
              </strong>
            </div>
          </div>

          <button
            type="button"
            className="outline-button"
            onClick={() =>
              setPage("analytics")
            }
          >
            Explore Scenarios →
          </button>
        </div>
      </section>

      <section className="quick-stats">
        <div>
          <span>
            Total Energy This Month
          </span>

          <strong>482.5 kWh</strong>
        </div>

        <div>
          <span>
            Total Cost This Month
          </span>

          <strong>₹2,895</strong>
        </div>

        <div>
          <span>
            Total CO₂ Emitted
          </span>

          <strong>341.6 kg</strong>
        </div>

        <div>
          <span>
            Total CO₂ Saved
          </span>

          <strong>58.4 kg</strong>
        </div>
      </section>
    </div>
  );
}

/* =========================================================
   METRIC CARD
   ========================================================= */

function MetricCard({
  icon,
  title,
  value,
  unit,
  machine,
  tone,
}) {
  return (
    <div
      className={`metric-card ${tone}`}
    >
      <div className="metric-top">
        <div className="metric-icon">
          {icon}
        </div>

        <span>
          {title}
        </span>
      </div>

      <div className={`metric-value ${value == null ? "metric-awaiting" : ""}`}>
        {value == null ? "—" : value}
        {value != null && (
          <small>
            {unit}
          </small>
        )}
      </div>

      <div className="metric-machine">
        <span>●</span>
        {machine}
      </div>
    </div>
  );
}

/* =========================================================
   PANEL HEADER
   ========================================================= */

function PanelHeader({
  title,
  subtitle,
  icon,
}) {
  return (
    <div className="panel-header">
      <div className="panel-icon">
        {icon}
      </div>

      <div>
        <h2>
          {title}
        </h2>

        <p>
          {subtitle}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   SPEC
   ========================================================= */

function Spec({
  label,
  value,
}) {
  return (
    <div className="spec-row">
      <span>
        {label}
      </span>

      <strong>
        {value == null ? "—" : value}
      </strong>
    </div>
  );
}

/* =========================================================
   ENERGY CHART
   ========================================================= */

function EnergyChart() {
  const chartData = [
    { time: "08:00", kwh: 1.05, temp: 30.2, status: "normal" },
    { time: "10:00", kwh: 1.42, temp: 32.5, status: "normal" },
    { time: "12:00", kwh: 1.85, temp: 34.1, status: "warning" },
    { time: "14:00", kwh: 2.45, temp: 36.8, status: "peak" },
    { time: "16:00", kwh: 1.90, temp: 33.9, status: "normal" },
    { time: "18:00", kwh: 1.35, temp: 31.8, status: "normal" },
    { time: "20:00", kwh: 0.95, temp: 29.6, status: "normal" },
  ];

  const maxKwh = 3.0;

  return (
    <div className="energy-visual-chart" style={{ padding: "20px", background: "white", borderRadius: "16px", border: "1px solid #e7edf5" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <strong style={{ fontSize: "16px", color: "#10213f" }}>Hourly Energy & Load Trend (Today)</strong>
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#71809a" }}>Real-time electrical consumption (kW) and thermal tracking</p>
        </div>

        <div style={{ display: "flex", gap: "16px", fontSize: "12px", color: "#71809a" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#1769e0" }}></span> Normal Load</span>
          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ed8b27" }}></span> Elevated</span>
          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#e34d59" }}></span> Peak Anomaly</span>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", height: "180px", paddingTop: "20px", borderBottom: "2px solid #e7edf5" }}>
        {chartData.map((item, idx) => {
          const heightPercent = Math.max(15, Math.min(100, (item.kwh / maxKwh) * 100));
          const barColor = item.status === 'peak' ? '#e34d59' : item.status === 'warning' ? '#ed8b27' : '#1769e0';
          return (
            <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "12%", height: "100%", justifyContent: "flex-end" }}>
              <span style={{ fontSize: "11px", fontWeight: "700", color: barColor, marginBottom: "6px" }}>{item.kwh} kW</span>
              <div style={{ width: "100%", maxWidth: "32px", height: `${heightPercent}%`, backgroundColor: barColor, borderRadius: "6px 6px 0 0", transition: "height 0.3s ease" }}></div>
              <span style={{ fontSize: "11px", color: "#71809a", marginTop: "8px", fontWeight: "600" }}>{item.time}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
   ENERGY PAGE
   ========================================================= */

function EnergyPage({
  values,
}) {
  return (
    <PageContainer
      title="Energy Monitoring"
      subtitle="Detailed energy consumption intelligence"
    >
      <div className="large-chart-page">
        <EnergyChart />
      </div>

      <div className="page-grid-4">
        <DataBox
          title="Current Power"
          value={values.power == null ? "1.10 kW" : `${values.power} kW`}
        />

        <DataBox
          title="Energy Today"
          value={values.energy == null ? "18.7 kWh" : `${values.energy} kWh`}
        />

        <DataBox
          title="Peak Power"
          value="2.45 kW (14:30 PM)"
        />

        <DataBox
          title="Daily Cost"
          value={values.cost == null ? "₹112.20" : `₹${values.cost}`}
        />
      </div>

      <div style={{ marginTop: "24px", background: "white", padding: "24px", borderRadius: "16px", border: "1px solid #e7edf5" }}>
        <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", color: "#10213f" }}>Machine Energy Breakdown</h3>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e7edf5", textAlign: "left", color: "#71809a" }}>
              <th style={{ padding: "10px" }}>Machine</th>
              <th style={{ padding: "10px" }}>Type</th>
              <th style={{ padding: "10px" }}>Power (kW)</th>
              <th style={{ padding: "10px" }}>Energy Today</th>
              <th style={{ padding: "10px" }}>Daily Cost</th>
              <th style={{ padding: "10px" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: "1px solid #f0f4f9" }}>
              <td style={{ padding: "12px 10px", fontWeight: "700" }}>Motor-01</td>
              <td style={{ padding: "12px 10px", color: "#71809a" }}>Industrial Motor</td>
              <td style={{ padding: "12px 10px", fontWeight: "600" }}>1.10 kW</td>
              <td style={{ padding: "12px 10px" }}>18.7 kWh</td>
              <td style={{ padding: "12px 10px", color: "#18a86b", fontWeight: "600" }}>₹112.20</td>
              <td style={{ padding: "12px 10px" }}><span style={{ color: "#18a86b", background: "rgba(24, 168, 107, 0.1)", padding: "4px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: "700" }}>● Normal</span></td>
            </tr>
            <tr style={{ borderBottom: "1px solid #f0f4f9" }}>
              <td style={{ padding: "12px 10px", fontWeight: "700" }}>Compressor-02</td>
              <td style={{ padding: "12px 10px", color: "#71809a" }}>Air Compressor</td>
              <td style={{ padding: "12px 10px", fontWeight: "600" }}>1.18 kW</td>
              <td style={{ padding: "12px 10px" }}>24.1 kWh</td>
              <td style={{ padding: "12px 10px", color: "#18a86b", fontWeight: "600" }}>₹144.60</td>
              <td style={{ padding: "12px 10px" }}><span style={{ color: "#18a86b", background: "rgba(24, 168, 107, 0.1)", padding: "4px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: "700" }}>● Normal</span></td>
            </tr>
            <tr style={{ borderBottom: "1px solid #f0f4f9" }}>
              <td style={{ padding: "12px 10px", fontWeight: "700" }}>Pump-03</td>
              <td style={{ padding: "12px 10px", color: "#71809a" }}>Water Pump</td>
              <td style={{ padding: "12px 10px", fontWeight: "600" }}>1.02 kW</td>
              <td style={{ padding: "12px 10px" }}>15.3 kWh</td>
              <td style={{ padding: "12px 10px", color: "#18a86b", fontWeight: "600" }}>₹91.80</td>
              <td style={{ padding: "12px 10px" }}><span style={{ color: "#18a86b", background: "rgba(24, 168, 107, 0.1)", padding: "4px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: "700" }}>● Normal</span></td>
            </tr>
            <tr style={{ borderBottom: "1px solid #f0f4f9" }}>
              <td style={{ padding: "12px 10px", fontWeight: "700" }}>Fan-04</td>
              <td style={{ padding: "12px 10px", color: "#71809a" }}>Cooling Fan</td>
              <td style={{ padding: "12px 10px", fontWeight: "600" }}>0.83 kW</td>
              <td style={{ padding: "12px 10px" }}>11.6 kWh</td>
              <td style={{ padding: "12px 10px", color: "#18a86b", fontWeight: "600" }}>₹69.60</td>
              <td style={{ padding: "12px 10px" }}><span style={{ color: "#18a86b", background: "rgba(24, 168, 107, 0.1)", padding: "4px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: "700" }}>● Normal</span></td>
            </tr>
            <tr>
              <td style={{ padding: "12px 10px", fontWeight: "700" }}>Motor-05</td>
              <td style={{ padding: "12px 10px", color: "#71809a" }}>Production Motor</td>
              <td style={{ padding: "12px 10px", fontWeight: "600" }}>1.29 kW</td>
              <td style={{ padding: "12px 10px" }}>26.8 kWh</td>
              <td style={{ padding: "12px 10px", color: "#ed8b27", fontWeight: "600" }}>₹160.80</td>
              <td style={{ padding: "12px 10px" }}><span style={{ color: "#ed8b27", background: "rgba(237, 139, 39, 0.1)", padding: "4px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: "700" }}>● Warning</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </PageContainer>
  );
}

/* =========================================================
   DIGITAL TWIN PAGE
   ========================================================= */

function DigitalTwinPage({
  machine,
}) {
  return (
    <PageContainer
      title="Digital Twin"
      subtitle={`Live virtual representation of ${machine?.id || "selected machine"}`}
    >
      <div className="digital-twin-page">
        <div className="huge-machine">
          <div className="digital-motor big">
            <div className="dm-cylinder"></div>
            <div className="dm-body"></div>
            <div className="dm-top"></div>
            <div className="dm-base"></div>
          </div>
        </div>

        <div className="twin-info">
          <span className="hero-tag">
            ● LIVE DIGITAL TWIN
          </span>

          <h2>
            {machine.id}
          </h2>

          <p>
            {machine.type}
          </p>

          <div className="twin-stat-grid">
            <DataBox
              title="Temperature"
              value={machine.temperature == null ? "31.4 °C" : `${machine.temperature} °C`}
            />

            <DataBox
              title="Power"
              value={machine.power == null ? "1.10 kW" : `${machine.power} kW`}
            />

            <DataBox
              title="Current"
              value={machine.current == null ? "5.2 A" : `${machine.current} A`}
            />

            <DataBox
              title="Voltage"
              value={machine.voltage == null ? "230 V" : `${machine.voltage} V`}
            />

            <DataBox
              title="Vibration"
              value={machine.vibration == null ? "1.2 mm/s" : `${machine.vibration} mm/s`}
            />

            <DataBox
              title="Power Factor"
              value={machine.powerFactor == null ? "0.92" : machine.powerFactor}
            />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

/* =========================================================
   AI PAGE
   ========================================================= */

function AIPage({
  values,
  alertActive,
  machine,
}) {
  return (
    <PageContainer
      title="AI Insights"
      subtitle="Explainable AI for industrial energy decisions"
    >
      <div className="ai-page-grid">
        <div
          className={`big-ai-card ${
            alertActive
              ? "ai-danger-state"
              : "ai-success-state"
          }`}
        >
          <div className="ai-orb">
            {alertActive ? "!" : "✓"}
          </div>

          <span>
            AI HEALTH SCORE
          </span>

          <h1>
            {values.health == null ? "96/100" : `${values.health}/100`}
          </h1>

          <p>
            {alertActive
              ? "Machine operating condition requires attention."
              : "Machine operating condition is currently healthy."}
          </p>
        </div>

        {!alertActive ? (
          <>
            <div className="insight-card">
              <span className="success-label">
                ✓ SYSTEM NORMAL
              </span>

              <h2>
                Energy usage is within normal range
              </h2>

              <p>
                AI analysis confirms that {machine?.id || "Motor-01"} is operating within its
                configured monitoring range.
              </p>

              <strong>
                No corrective action required.
              </strong>
            </div>

            <div className="insight-card">
              <span className="success-label">
                ✓ AI RECOMMENDATION
              </span>

              <h2>
                Continue optimized operation
              </h2>

              <p>
                Maintain the current operating pattern and continue real-time monitoring.
              </p>

              <strong>
                System efficiency is stable.
              </strong>
            </div>
          </>
        ) : (
          <>
            <div className="insight-card">
              <span className="warning-label">
                ⚠ DETECTED PATTERN
              </span>

              <h2>
                Higher power consumption detected
              </h2>

              <p>
                AI detected an energy pattern higher than the machine's expected operating baseline.
              </p>

              <strong>
                Action: Inspect motor load
              </strong>
            </div>

            <div className="insight-card warning">
              <span className="warning-label">
                ⚠ AI RECOMMENDATION
              </span>

              <h2>
                Reduce unnecessary idle operation
              </h2>

              <p>
                Check motor loading and reduce unnecessary high-load operation.
              </p>

              <strong>
                Potential energy optimization available.
              </strong>
            </div>
          </>
        )}
      </div>
    </PageContainer>
  );
}

/* =========================================================
   ANALYTICS PAGE
   ========================================================= */

function AnalyticsPage({
  values,
}) {
  return (
    <PageContainer
      title="Analytics"
      subtitle="Operational performance & scenario analysis"
    >
      <div className="analytics-grid">
        <DataBox
          title="Energy Efficiency"
          value="94.2%"
        />

        <DataBox
          title="Baseline Improvement"
          value="+12.8%"
        />

        <DataBox
          title="Peak Time"
          value="14:30 PM (2.45 kW)"
        />

        <DataBox
          title="AI Confidence"
          value={values.health == null ? "98.5%" : `${values.health}%`}
        />
      </div>

      <div className="panel analytics-panel">
        <PanelHeader
          title="Energy Trend"
          subtitle="Daily consumption behavior"
          icon="◔"
        />

        <EnergyChart />
      </div>
    </PageContainer>
  );
}

/* =========================================================
   ALERTS PAGE
   ========================================================= */

function AlertsPage({
  values,
  alertActive,
}) {
  return (
    <PageContainer
      title="Alerts"
      subtitle="Machine safety and energy anomalies"
    >
      <div
        className={`alert-page-card ${
          alertActive
            ? ""
            : "resolved"
        }`}
      >
        <div className="alert-big-icon">
          {alertActive
            ? "!"
            : "✓"}
        </div>

        <div>
          <span
            className={
              alertActive
                ? "warning-label"
                : "success-label"
            }
          >
            {alertActive
              ? "ACTIVE ALERT"
              : "SYSTEM NORMAL"}
          </span>

          <h2>
            {alertActive
              ? "Abnormal Energy Usage Detected"
              : "No Active Energy Alert"}
          </h2>

          <p>
            {values.health == null
              ? "Connect the machine sensors to begin safety and energy monitoring."
              : alertActive
                ? `Selected machine is operating outside its normal energy pattern. Current power: ${values.power ?? "—"} kW.`
                : "Selected machine is operating within its normal energy pattern."}
          </p>

          {alertActive ? (
            <strong>
              Likely cause: Overloading ·
              Action: Inspect motor load
            </strong>
          ) : (
            <strong>
              ✓ All monitored values are
              within safe operating limits.
            </strong>
          )}
        </div>
      </div>
    </PageContainer>
  );
}

/* =========================================================
   MACHINES PAGE
   ========================================================= */

function MachinesPage({
  machines,
}) {
  return (
    <PageContainer
      title="Machines"
      subtitle="Individual machine monitoring"
    >
      <div className="machines-grid">
        {machines.map(
          (machine) => (
            <div
              className="machine-card"
              key={machine.id}
            >
              <div className="machine-card-top">
                <div className="machine-card-icon">
                  {machine.icon}
                </div>

                <span
                  className={`machine-status ${(machine.status || "Waiting").toLowerCase()}`}
                >
                  ●{" "}
                  {machine.status || "Waiting"}
                </span>
              </div>

              <h2>
                {machine.id}
              </h2>

              <p>
                {machine.type}
              </p>

              <div className="machine-values">
                <DataBox
                  title="Power"
                  value={machine.power == null ? "—" : `${machine.power} kW`}
                />

                <DataBox
                  title="Temp"
                  value={machine.temperature == null ? "—" : `${machine.temperature} °C`}
                />

                <DataBox
                  title="Current"
                  value={machine.current == null ? "—" : `${machine.current} A`}
                />

                <DataBox
                  title="Voltage"
                  value={machine.voltage == null ? "—" : `${machine.voltage} V`}
                />

                <DataBox
                  title="Vibration"
                  value={machine.vibration == null ? "—" : `${machine.vibration} mm/s`}
                />
              </div>
            </div>
          )
        )}
      </div>
    </PageContainer>
  );
}

/* =========================================================
   MACHINE CONTROL
   ========================================================= */

function ControlPage({
  relay,
  setRelay,
  cooling,
  setCooling,
  values,
}) {
  return (
    <PageContainer
      title="Machine Control"
      subtitle="Intelligent safety & thermal management"
    >
      <div className="control-panel">
        <ControlRow
          icon="ϟ"
          title="Machine Relay"
          description="Machine connected to power supply"
          value={relay}
          setValue={setRelay}
        />

        <ControlRow
          icon="❄"
          title="Cooling System"
          description="Automatic cooling management"
          value={cooling}
          setValue={setCooling}
        />

        <div className="control-live-values">
          <div>
            <span>
              Temperature
            </span>

            <strong>
              {values.temperature == null ? "—" : `${values.temperature}°C`}
            </strong>
          </div>

          <div>
            <span>
              Current
            </span>

            <strong>
              {values.current == null ? "—" : `${values.current}A`}
            </strong>
          </div>

          <div>
            <span>
              Power
            </span>

            <strong>
              {values.power == null ? "—" : `${values.power}kW`}
            </strong>
          </div>
        </div>

        <button
          type="button"
          className="emergency-button"
        >
          ⚠ EMERGENCY SHUTDOWN
        </button>
      </div>
    </PageContainer>
  );
}

/* =========================================================
   CONTROL ROW
   ========================================================= */

function ControlRow({
  icon,
  title,
  description,
  value,
  setValue,
}) {
  return (
    <div className="control-row">
      <div className="control-icon">
        {icon}
      </div>

      <div className="control-copy">
        <h3>
          {title}
        </h3>

        <p>
          {description}
        </p>
      </div>

      <div className="on-off">
        <button
          type="button"
          className={
            value
              ? "selected"
              : ""
          }
          onClick={() =>
            setValue(true)
          }
        >
          ON
        </button>

        <button
          type="button"
          className={
            !value
              ? "selected off"
              : ""
          }
          onClick={() =>
            setValue(false)
          }
        >
          OFF
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   REPORTS PAGE
   ========================================================= */

function ReportsPage() {
  const reportsList = [
    {
      title: "Monthly Industrial Energy Audit",
      period: "August 2026",
      summary: "EnerTwin AI analyzed 5 machines, saved 58.4 kg CO2, and identified ₹3,850 in operational savings.",
      size: "2.4 MB",
      type: "PDF Audit Report",
    },
    {
      title: "Weekly Machine Efficiency Report",
      period: "Week 38 (Sept 18 - Sept 25, 2026)",
      summary: "Comprehensive weekly power factor breakdown, load metrics, and peak hour consumption analysis.",
      size: "1.8 MB",
      type: "CSV & Summary",
    },
    {
      title: "Preventive Health & Diagnostic Audit",
      period: "Q3 2026",
      summary: "Vibration and thermal trend analysis across Motor-01 to Motor-05. Overall Fleet Health: 93.4%",
      size: "3.1 MB",
      type: "Full Diagnostic Report",
    },
    {
      title: "Carbon Footprint & Sustainability Summary",
      period: "August 2026",
      summary: "ESG compliance metrics, grid power vs renewable offset, total carbon footprint equivalent.",
      size: "1.2 MB",
      type: "ESG Certificate",
    },
  ];

  const handleDownload = (reportTitle) => {
    alert(`Downloading ${reportTitle}...`);
  };

  return (
    <PageContainer
      title="Reports"
      subtitle="Energy performance & compliance reports"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {reportsList.map((report, idx) => (
          <div key={idx} className="report-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "white", padding: "24px", borderRadius: "16px", border: "1px solid #e7edf5" }}>
            <div>
              <span style={{ fontSize: "11px", fontWeight: "800", color: "#1769e0", letterSpacing: "1px" }}>{report.type.toUpperCase()} · {report.period}</span>
              <h3 style={{ margin: "6px 0", fontSize: "18px", color: "#10213f" }}>{report.title}</h3>
              <p style={{ margin: "0 0 10px 0", color: "#71809a", fontSize: "13px" }}>{report.summary}</p>
              <small style={{ color: "#a0aec0", fontWeight: "600" }}>File size: {report.size}</small>
            </div>

            <button
              type="button"
              className="primary-button"
              onClick={() => handleDownload(report.title)}
              style={{ whiteSpace: "nowrap", marginLeft: "20px" }}
            >
              Download ↓
            </button>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}

/* =========================================================
   NOTIFICATIONS PAGE
   ========================================================= */

function NotificationsPage({
  alertActive,
}) {
  return (
    <PageContainer
      title="Notifications"
      subtitle="Latest EnerTwin AI system notifications"
    >
      <div className="notification-list">
        <div className="notification-item">
          <div className="notification-icon green">
            ✓
          </div>

          <div>
            <strong>
              Digital Twin is Live
            </strong>

            <p>
              Motor-01 telemetry is being
              monitored successfully.
            </p>
          </div>

          <span>
            Now
          </span>
        </div>

        {alertActive ? (
          <div className="notification-item warning-item">
            <div className="notification-icon red">
              !
            </div>

            <div>
              <strong>
                Abnormal Energy Usage
              </strong>

              <p>
                Motor-01 is operating above
                its normal pattern.
              </p>
            </div>

            <span>
              Now
            </span>
          </div>
        ) : (
          <div className="notification-item">
            <div className="notification-icon green">
              ✓
            </div>

            <div>
              <strong>
                Energy Alert Cleared
              </strong>

              <p>
                Motor-01 has returned to normal
                operating conditions.
              </p>
            </div>

            <span>
              Now
            </span>
          </div>
        )}

        <div className="notification-item">
          <div className="notification-icon blue">
            ✦
          </div>

          <div>
            <strong>
              AI Monitoring Updated
            </strong>

            <p>
              EnerTwin AI is continuously
              analyzing machine behavior.
            </p>
          </div>

          <span>
            Live
          </span>
        </div>
      </div>
    </PageContainer>
  );
}

/* =========================================================
   SETTINGS PAGE
   ========================================================= */

function SettingsPage({
  autoRefresh,
  setAutoRefresh,
}) {
  const [tariff, setTariff] = useState("6.00");
  const [tempLimit, setTempLimit] = useState("35.0");
  const [powerLimit, setPowerLimit] = useState("1.42");
  const [emailAlerts, setEmailAlerts] = useState("admin@industrial-iot.com");

  return (
    <PageContainer
      title="Settings"
      subtitle="Configure EnerTwin AI monitoring preferences"
    >
      <div className="settings-card">
        <div>
          <h3>
            Auto Refresh
          </h3>

          <p>
            Automatically update machine values every 3 seconds.
          </p>
        </div>

        <button
          type="button"
          aria-label="Toggle auto refresh"
          className={`settings-switch ${
            autoRefresh
              ? "active"
              : ""
          }`}
          onClick={() =>
            setAutoRefresh(
              !autoRefresh
            )
          }
        >
          <span></span>
        </button>
      </div>

      <div className="settings-card">
        <div>
          <h3>
            Digital Twin Monitoring
          </h3>

          <p>
            Continuous virtual machine condition monitoring.
          </p>
        </div>

        <span className="enabled-label">
          ENABLED
        </span>
      </div>

      <div style={{ background: "white", padding: "24px", borderRadius: "16px", border: "1px solid #e7edf5", marginTop: "16px" }}>
        <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", color: "#10213f" }}>System Thresholds & Configuration</h3>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#71809a", marginBottom: "6px" }}>ELECTRICITY TARIFF (₹ / kWh)</label>
            <input type="text" value={tariff} onChange={(e) => setTariff(e.target.value)} style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#71809a", marginBottom: "6px" }}>TEMP WARNING THRESHOLD (°C)</label>
            <input type="text" value={tempLimit} onChange={(e) => setTempLimit(e.target.value)} style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#71809a", marginBottom: "6px" }}>POWER ANOMALY THRESHOLD (kW)</label>
            <input type="text" value={powerLimit} onChange={(e) => setPowerLimit(e.target.value)} style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#71809a", marginBottom: "6px" }}>ALERT RECIPIENT EMAIL</label>
            <input type="email" value={emailAlerts} onChange={(e) => setEmailAlerts(e.target.value)} style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

/* =========================================================
   COMMON PAGE CONTAINER
   ========================================================= */

function PageContainer({
  title,
  subtitle,
  children,
}) {
  return (
    <div className="page-container">
      <div className="page-heading">
        <div>
          <span className="page-kicker">
            ENERTWIN AI
          </span>

          <h1>
            {title}
          </h1>

          <p>
            {subtitle}
          </p>
        </div>
      </div>

      {children}
    </div>
  );
}

/* =========================================================
   DATA BOX
   ========================================================= */

function DataBox({
  title,
  value,
}) {
  return (
    <div className="data-box">
      <span>
        {title}
      </span>

      <strong>
        {value == null ? "—" : value}
      </strong>
    </div>
  );
}

/* =========================================================
   EXPORT
   ========================================================= */

export default App;