const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
function analyzeEnergy(power, temperature) {
  let status;
  let recommendation;

  if (power > 2.75) {
    status = "HIGH";
    recommendation = "Reduce unnecessary machine load and check high-power equipment.";
  } else if (power > 2.55) {
    status = "MODERATE";
    recommendation = "Energy usage is slightly elevated. Monitor the equipment.";
  } else {
    status = "NORMAL";
    recommendation = "Energy consumption is within the normal range.";
  }

  return {
    status: status,
    recommendation: recommendation
  };
}
app.get("/", (req, res) => {
  res.json({
    message: "EnerTwin AI Backend is running",
    status: "OK"
  });
});
app.get("/api/sensor-data", (req, res) => {
  const machinesData = [
    {
      id: "Motor-01",
      machineId: "Motor-01",
      temperature: Number((31.0 + Math.random() * 1.5).toFixed(1)),
      power: Number((1.05 + Math.random() * 0.15).toFixed(2)),
      voltage: Math.floor(228 + Math.random() * 5),
      current: Number((4.9 + Math.random() * 0.6).toFixed(2)),
      energy: Number((18.5 + Math.random() * 0.5).toFixed(1)),
      vibration: Number((1.1 + Math.random() * 0.3).toFixed(1)),
      frequency: 50.0,
      powerFactor: 0.92,
    },
    {
      id: "Compressor-02",
      machineId: "Compressor-02",
      temperature: Number((33.5 + Math.random() * 1.5).toFixed(1)),
      power: Number((1.15 + Math.random() * 0.1).toFixed(2)),
      voltage: Math.floor(227 + Math.random() * 4),
      current: Number((5.4 + Math.random() * 0.4).toFixed(2)),
      energy: Number((23.8 + Math.random() * 0.6).toFixed(1)),
      vibration: Number((1.7 + Math.random() * 0.3).toFixed(1)),
      frequency: 50.1,
      powerFactor: 0.91,
    },
    {
      id: "Pump-03",
      machineId: "Pump-03",
      temperature: Number((29.5 + Math.random() * 1.2).toFixed(1)),
      power: Number((0.98 + Math.random() * 0.1).toFixed(2)),
      voltage: Math.floor(230 + Math.random() * 3),
      current: Number((4.6 + Math.random() * 0.4).toFixed(2)),
      energy: Number((15.0 + Math.random() * 0.5).toFixed(1)),
      vibration: Number((0.8 + Math.random() * 0.2).toFixed(1)),
      frequency: 49.9,
      powerFactor: 0.93,
    },
    {
      id: "Fan-04",
      machineId: "Fan-04",
      temperature: Number((28.0 + Math.random() * 1.0).toFixed(1)),
      power: Number((0.80 + Math.random() * 0.08).toFixed(2)),
      voltage: Math.floor(229 + Math.random() * 3),
      current: Number((3.8 + Math.random() * 0.3).toFixed(2)),
      energy: Number((11.4 + Math.random() * 0.4).toFixed(1)),
      vibration: Number((0.6 + Math.random() * 0.2).toFixed(1)),
      frequency: 50.0,
      powerFactor: 0.94,
    },
    {
      id: "Motor-05",
      machineId: "Motor-05",
      temperature: Number((36.0 + Math.random() * 1.5).toFixed(1)),
      power: Number((1.28 + Math.random() * 0.15).toFixed(2)),
      voltage: Math.floor(225 + Math.random() * 4),
      current: Number((6.1 + Math.random() * 0.5).toFixed(2)),
      energy: Number((26.5 + Math.random() * 0.7).toFixed(1)),
      vibration: Number((2.2 + Math.random() * 0.4).toFixed(1)),
      frequency: 49.8,
      powerFactor: 0.90,
    }
  ];

  const primary = machinesData[0];
  const aiAnalysis = analyzeEnergy(primary.power, primary.temperature);

  res.json({
    machines: machinesData,
    temperature: primary.temperature,
    power: primary.power,
    voltage: primary.voltage,
    current: primary.current,
    energyToday: primary.energy,
    aiStatus: aiAnalysis.status,
    aiRecommendation: aiAnalysis.recommendation
  });
});
const PORT = 5000;

app.listen(PORT, () => {
  console.log(`EnerTwin AI Backend running on http://localhost:${PORT}`);
});