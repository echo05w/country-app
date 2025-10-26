import React, { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch("http://localhost:3000/countries?fields=name,cca2,flags,region");
        if (!res.ok) throw new Error("Network response was not ok");
        const data = await res.json();
        setCountries(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCountries();
  }, []);

  if (loading) return <h2>Loading countries...</h2>;
  if (error) return <h2 style={{ color: "red" }}>Error: {error}</h2>;

  return (
    <div className="App">
      <h1>🌍 Countries of the World</h1>
      <div className="grid">
        {countries.map((c) => (
          <div key={c.cca2} className="card">
            <img src={c.flags?.png} alt={c.name?.common} />
            <h3>{c.name?.common}</h3>
            <p>{c.region}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
