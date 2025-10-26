import express from "express";
import axios from "axios";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import NodeCache from "node-cache";
import rateLimit from "express-rate-limit";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || "https://restcountries.com/v3.1";
const CACHE_TTL_SECONDS = Number(process.env.CACHE_TTL_SECONDS || 600);

const cache = new NodeCache({ stdTTL: CACHE_TTL_SECONDS, checkperiod: 120 });

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

const limiter = rateLimit({ windowMs: 60 * 1000, max: 120 });
app.use(limiter);

async function cachedGet(key, url) {
  const hit = cache.get(key);
  if (hit) return hit;
  const { data } = await axios.get(url, { timeout: 15000 });
  cache.set(key, data);
  return data;
}

app.get("/health", (req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

app.get("/countries", async (req, res) => {
  try {
    const { fields, region, name, code } = req.query;
    let url;
    if (code) {
      const list = code.split(",").map((c) => c.trim()).join(",");
      url = `${BASE_URL}/alpha?codes=${encodeURIComponent(list)}`;
    } else if (name) {
      url = `${BASE_URL}/name/${encodeURIComponent(name)}`;
    } else if (region) {
      url = `${BASE_URL}/region/${encodeURIComponent(region)}`;
    } else {
      url = `${BASE_URL}/all`;
    }

    const finalUrl = fields ? `${url}?fields=${encodeURIComponent(fields)}` : url;
    const key = `GET:${finalUrl}`;
    const data = await cachedGet(key, finalUrl);
    res.json(data);
  } catch (err) {
    const status = err.response?.status || 500;
    res.status(status).json({
      error: true,
      message: err.response?.data?.message || err.message || "Unknown error",
    });
  }
});

app.get("/countries/:code", async (req, res) => {
  try {
    const { code } = req.params;
    const { fields } = req.query;
    const url = `${BASE_URL}/alpha/${encodeURIComponent(code)}${
      fields ? `?fields=${encodeURIComponent(fields)}` : ""
    }`;
    const key = `GET:${url}`;
    const data = await cachedGet(key, url);
    res.json(Array.isArray(data) ? data[0] : data);
  } catch (err) {
    const status = err.response?.status || 500;
    res.status(status).json({
      error: true,
      message: err.response?.data?.message || err.message || "Unknown error",
    });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: true, message: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`Country API backend running at http://localhost:${PORT}`);
});
