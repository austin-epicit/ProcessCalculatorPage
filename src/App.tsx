import { useState, useEffect } from 'react';
import './App.css';

const TIME_UNITS = ['Seconds', 'Minutes', 'Hours'] as const;
const PERIODS = ['Work Day', 'Day', 'Work Week', 'Week', 'Month', 'Quarter', 'Year'] as const;

export default function ProcessCostCalculator() {
  const [timeUnit, setTimeUnit] = useState('Seconds');
  const [period, setPeriod] = useState('Day');
  const [processTime, setProcessTime] = useState(45);
  const [processCount, setProcessCount] = useState(50);
  const [wage, setWage] = useState(32.03);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [totalCost, setTotalCost] = useState<number | null>(null);

  useEffect(() => {
    const unitInSeconds = { Seconds: 1, Minutes: 60, Hours: 3600 }[timeUnit] ?? 0;
    const periodInDays = { 'Work Day': 1, Day: 1, 'Work Week': 5, Week: 7, Month: 30, Quarter: 90, Year: 365 }[period] ?? 0;
    const secondsPerPeriod = processTime * processCount * unitInSeconds * periodInDays;
    const hours = secondsPerPeriod / 3600;
    const cost = hours * wage;
    setTotalCost(cost);
  }, [timeUnit, period, processTime, processCount, wage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name,
      email,
      totalCost,
      source: "Process Cost Calculator",
    };

    try {
      const res = await fetch("/api/send-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to send lead");
      }

      setSubmitted(true);
    } catch (err) {
      console.error("Submission failed:", err);
      alert("There was an issue submitting your information. Please try again.");
    }
  };

  return (
    <div className="page-wrapper">
      <section className="dark-section">
        <div className="header-text">
          <h1 className="title">PROCESS COST CALCULATOR</h1>
          <p>This tool will help you calculate exactly how much a process is currently costing you.</p>
          <p className="subtext">
            We can help you reduce your process time substantially. We are experts in automation, integrations, and
            workflow improvement. Our list continues to grow. Learn more about why optimizing your processes saves both
            time and money.
          </p>
          <p className="stat">
            Average Annual Hourly Earnings for 2024 = <b>$33.48</b><br />
            <span>(Per US Bureau of Labor Statistics)</span>
          </p>
        </div>
      </section>

      <div className="calculator-layout">
        {/* LEFT SIDE */}
        <div className="calculator">
          <div className="form-group">
            <h2>1. My Process is measured in *</h2>
            <div className="radio-group">
              {TIME_UNITS.map((unit) => (
                <label key={unit} className={`radio-box ${timeUnit === unit ? 'active' : ''}`}>
                  <input type="radio" value={unit} checked={timeUnit === unit} onChange={() => setTimeUnit(unit)} />
                  {unit}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <h2>2. Per *</h2>
            <div className="radio-group">
              {PERIODS.map((p) => (
                <label key={p} className={`radio-box ${period === p ? 'active' : ''}`}>
                  <input type="radio" value={p} checked={period === p} onChange={() => setPeriod(p)} />
                  {p}
                </label>
              ))}
            </div>
          </div>
          {/* Process Time Slider */}
          <div className="form-group slider-group">
            <h2>3. Process Time in [{timeUnit}]</h2>
            <div className="slider-wrapper">
              <div className="tick-overlay" aria-hidden="true"></div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={processTime}
                style={{ '--percent': `${processTime}%` } as React.CSSProperties}
                onChange={(e) => setProcessTime(Number(e.target.value))}
              />
              <div className="slider-ticks">
                {[0, 25, 50, 75, 100].map((val) => (
                  <span key={val}>{val}</span>
                ))}
              </div>
              <div className="slider-value">{processTime}</div>
            </div>
          </div>

          {/* Process Count Slider */}
          <div className="form-group slider-group">
            <h2>4. Process Count per [{period}]</h2>
            <div className="slider-wrapper">
              <div className="tick-overlay" aria-hidden="true"></div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={processCount}
                style={{ '--percent': `${processCount}%` } as React.CSSProperties}
                onChange={(e) => setProcessCount(Number(e.target.value))}
              />
              <div className="slider-ticks">
                {[0, 25, 50, 75, 100].map((val) => (
                  <span key={val}>{val}</span>
                ))}
              </div>
              <div className="slider-value">{processCount}</div>
            </div>
          </div>

          <div className="form-group">
            <h2>5. Employee Wage per Hour *</h2>
            <p className="note">
              Average national hourly wage is <b>$32.05</b><br />
              <span>(Based on 2023 National Wage Index by the Social Security Administration)</span>
            </p>
            <input type="number" value={wage} onChange={(e) => setWage(Number(e.target.value))} />
          </div>

        </div>

        {/* RIGHT SIDE FORM */}
        <div className="lead-form">
          <h2>Enter your name and email to see your results!</h2>
          <p>You will receive a copy of the results in your email.</p>
          {!submitted ? (
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit">Submit</button>
            </form>
          ) : (
            <p className="thank-you">✅ Thank you! Your results have been sent.</p>
          )}
        </div>
      </div>
    </div>
  );
}
