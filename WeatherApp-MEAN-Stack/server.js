const express = require("express");
const axios = require("axios");
const cors = require("cors");
const app = express();
const mongoose = require("mongoose");
const PORT = process.env.PORT || 8080;

const favoriteSchema = new mongoose.Schema(
  {
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);
const corsOptions = {
  origin: "http://localhost:8080",
  methods: ["GET", "POST", "DELETE", "PUT", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static("frontend/dist/frontend"));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:8080");
  res.header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

mongoose
  .connect(
    "mongodb+srv://ngovinda:Ic5mSPJhfr6DkrIJ@clusterweatherapp.7x0tn.mongodb.net/?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: "weatherapp",
    }
  )
  .then(() => {
    console.log("Connected to MongoDB Atlas successfully");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected");
});

const Favorite = mongoose.model("Favorite", favoriteSchema);

app.get("/api/favorites", async (req, res) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:8080");
  try {
    const favorites = await Favorite.find().sort({ createdAt: -1 });
    console.log("Fetched favorites:", favorites);
    res.json(favorites);
  } catch (error) {
    console.error("Error fetching favorites:", error);
    res.status(500).json({
      message: "Error fetching favorites",
      error: error.message,
    });
  }
});

app.post("/api/favorites", async (req, res) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:8080");
  try {
    const { city, state } = req.body;

    if (!city || !state) {
      return res.status(400).json({
        message: "City and state are required",
      });
    }

    const existing = await Favorite.findOne({ city, state });
    if (existing) {
      return res.status(409).json({
        message: "This location is already in favorites",
      });
    }

    const favorite = new Favorite({ city, state });
    const savedFavorite = await favorite.save();
    console.log("Saved favorite:", savedFavorite);
    res.status(201).json(savedFavorite);
  } catch (error) {
    console.error("Error adding favorite:", error);
    res.status(500).json({
      message: "Error adding favorite",
      error: error.message,
    });
  }
});

app.delete("/api/favorites/:id", async (req, res) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:8080");
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid favorite ID",
      });
    }

    const result = await Favorite.findByIdAndDelete(id);
    if (!result) {
      return res.status(404).json({
        message: "Favorite not found",
      });
    }

    res.json({ message: "Favorite deleted successfully" });
  } catch (error) {
    console.error("Error deleting favorite:", error);
    res.status(500).json({
      message: "Error deleting favorite",
      error: error.message,
    });
  }
});
const GOOGLE_API_KEY = "API_KEY";
const WEATHER_API_KEY = "API_KEY";

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.get("/api/weather", async (req, res) => {
  const { latitude, longitude } = req.query;

  if (!latitude || !longitude) {
    return res
      .status(400)
      .json({ error: "Latitude and longitude are required" });
  }

  const weatherUrl = `https://api.tomorrow.io/v4/timelines?location=${latitude},${longitude}&fields=temperature,temperatureApparent,temperatureMin,temperatureMax,windSpeed,windDirection,humidity,pressureSeaLevel,uvIndex,weatherCode,precipitationProbability,precipitationType,sunriseTime,sunsetTime,visibility,moonPhase,cloudCover&timesteps=1h,1d&units=imperial&timezone=America/Los_Angeles&apikey=${WEATHER_API_KEY}`;

  try {
    const response = await axios.get(weatherUrl);
    res.json(response.data);
  } catch (error) {
    console.error("Weather API error:", error.message);
    res.status(500).json({
      error: "Error fetching weather data",
      message: error.message,
    });
  }
});

app.get("/api/autocomplete", async (req, res) => {
  const { input } = req.query;

  if (!input) {
    return res.json({ predictions: [] });
  }

  try {
    const googleApiUrl =
      "https://maps.googleapis.com/maps/api/place/autocomplete/json";
    const response = await axios.get(googleApiUrl, {
      params: {
        input: input,
        types: "(cities)",
        components: "country:us",
        key: GOOGLE_API_KEY,
        sessiontoken: req.headers["x-session-token"] || undefined,
      },
      headers: {
        Accept: "application/json",
      },
    });

    if (response.data.status === "OK") {
      const predictions = response.data.predictions
        .slice(0, 5)
        .map((prediction) => ({
          description: prediction.structured_formatting.main_text,
          place_id: prediction.place_id,
        }));
      res.json({ predictions });
    } else {
      console.error("Google Places API error:", response.data.status);
      res.status(500).json({ error: "Error fetching predictions" });
    }
  } catch (error) {
    console.error("Server error:", error.message);
    res.status(500).json({
      error: "Server error",
      message: error.message,
    });
  }
});

app.get("/api/geocode", async (req, res) => {
  const { place_id } = req.query;

  if (!place_id) {
    return res.status(400).json({ error: "Place ID is required" });
  }

  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json`,
      {
        params: {
          place_id: place_id,
          key: GOOGLE_API_KEY,
        },
      }
    );

    if (response.data.status === "OK") {
      const location = response.data.results[0].geometry.location;
      res.json({
        latitude: location.lat,
        longitude: location.lng,
      });
    } else {
      res.status(500).json({ error: "Error fetching coordinates" });
    }
  } catch (error) {
    console.error("Geocoding error:", error.message);
    res.status(500).json({
      error: "Error fetching coordinates",
      message: error.message,
    });
  }
});
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Something went wrong!",
    message: err.message,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
