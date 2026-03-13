const useLocationBtn = document.getElementById("use-location-btn");
const suburbForm = document.getElementById("suburb-form");
const suburbInput = document.getElementById("suburb-input");

const locationNameEl = document.getElementById("location-name");
const uvIndexValueEl = document.getElementById("uv-index-value");
const uvIndexCircleEl = document.getElementById("uv-index-circle");
const riskPillEl = document.getElementById("risk-pill");
const uvMessageEl = document.getElementById("uv-message");
const lastUpdatedEl = document.getElementById("last-updated");
const hourlyGridEl = document.getElementById("hourly-grid");

function getUvRiskDetails(uv) {
  if (uv < 3) {
    return {
      label: "Low",
      colorClass: "uv-low",
      message: "Low UV right now. Basic protection is usually enough."
    };
  }

  if (uv < 6) {
    return {
      label: "Moderate",
      colorClass: "uv-moderate",
      message: "Moderate UV. Consider sunscreen, sunglasses, and shade."
    };
  }

  if (uv < 8) {
    return {
      label: "High",
      colorClass: "uv-high",
      message: "High UV. Protection needed now."
    };
  }

  if (uv < 11) {
    return {
      label: "Very High",
      colorClass: "uv-very-high",
      message: "Very high UV. Protect your skin now and seek shade when possible."
    };
  }

  return {
    label: "Extreme",
    colorClass: "uv-extreme",
    message: "Extreme UV. Minimise direct sun exposure and protect immediately."
  };
}

function formatHour(dateTimeString) {
  const date = new Date(dateTimeString);
  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit"
  });
}

function resetUvClasses() {
  uvIndexCircleEl.classList.remove(
    "uv-low",
    "uv-moderate",
    "uv-high",
    "uv-very-high",
    "uv-extreme"
  );

  riskPillEl.classList.remove(
    "uv-low",
    "uv-moderate",
    "uv-high",
    "uv-very-high",
    "uv-extreme"
  );
}

function renderUvResult(locationLabel, currentUv, currentTime, hourlyTimes, hourlyUvValues) {
  const roundedUv = Number(currentUv).toFixed(1);
  const risk = getUvRiskDetails(Number(currentUv));

  locationNameEl.textContent = locationLabel;
  uvIndexValueEl.textContent = roundedUv;
  riskPillEl.textContent = risk.label;
  uvMessageEl.textContent = risk.message;
  lastUpdatedEl.textContent = new Date(currentTime).toLocaleString();

  resetUvClasses();
  uvIndexCircleEl.classList.add(risk.colorClass);
  riskPillEl.classList.add(risk.colorClass);

  hourlyGridEl.innerHTML = "";

  const nextItems = hourlyTimes.slice(0, 6).map((time, index) => ({
    time,
    uv: hourlyUvValues[index]
  }));

  nextItems.forEach((item) => {
    const card = document.createElement("div");
    card.className = "hour-card";
    card.innerHTML = `
      <p class="hour-time">${formatHour(item.time)}</p>
      <p class="hour-uv">UV ${Number(item.uv).toFixed(1)}</p>
    `;
    hourlyGridEl.appendChild(card);
  });
}

async function fetchUvByCoordinates(latitude, longitude, locationLabel) {
  try {
    locationNameEl.textContent = locationLabel || "Fetching location...";
    uvIndexValueEl.textContent = "--";
    riskPillEl.textContent = "Loading...";
    uvMessageEl.textContent = "Loading live UV data...";
    lastUpdatedEl.textContent = "--";
    hourlyGridEl.innerHTML = "<p>Loading forecast...</p>";

    const endpoint = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=uv_index&hourly=uv_index&timezone=auto&forecast_hours=6`;

    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error("Failed to fetch UV data.");
    }

    const data = await response.json();

    const currentUv = data.current?.uv_index;
    const currentTime = data.current?.time;
    const hourlyTimes = data.hourly?.time || [];
    const hourlyUvValues = data.hourly?.uv_index || [];

    if (currentUv === undefined || !hourlyTimes.length || !hourlyUvValues.length) {
      throw new Error("UV data was unavailable for this location.");
    }

    renderUvResult(locationLabel, currentUv, currentTime, hourlyTimes, hourlyUvValues);
  } catch (error) {
    resetUvClasses();
    locationNameEl.textContent = locationLabel || "Location unavailable";
    uvIndexValueEl.textContent = "--";
    riskPillEl.textContent = "Unavailable";
    uvMessageEl.textContent = error.message;
    lastUpdatedEl.textContent = "--";
    hourlyGridEl.innerHTML = "<p>Could not load forecast.</p>";
  }
}

async function searchSuburbAndFetchUv(query) {
  try {
    locationNameEl.textContent = "Searching...";
    uvMessageEl.textContent = "Looking up suburb...";
    hourlyGridEl.innerHTML = "<p>Loading forecast...</p>";

    const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&countryCode=AU`;

    const response = await fetch(geocodeUrl);
    if (!response.ok) {
      throw new Error("Failed to search suburb.");
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      throw new Error("No matching Australian suburb found.");
    }

    const place = data.results[0];
    const labelParts = [place.name, place.admin1, place.country].filter(Boolean);
    const locationLabel = labelParts.join(", ");

    await fetchUvByCoordinates(place.latitude, place.longitude, locationLabel);
  } catch (error) {
    resetUvClasses();
    locationNameEl.textContent = "Search failed";
    uvIndexValueEl.textContent = "--";
    riskPillEl.textContent = "Unavailable";
    uvMessageEl.textContent = error.message;
    lastUpdatedEl.textContent = "--";
    hourlyGridEl.innerHTML = "<p>Try another suburb or use your location.</p>";
  }
}

function useBrowserLocation() {
  if (!navigator.geolocation) {
    uvMessageEl.textContent = "Geolocation is not supported in this browser.";
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;
      await fetchUvByCoordinates(latitude, longitude, "Your current location");
    },
    (error) => {
      let message = "Unable to get your location.";

      if (error.code === 1) {
        message = "Location permission was denied. Please search by suburb instead.";
      } else if (error.code === 2) {
        message = "Location information is unavailable right now.";
      } else if (error.code === 3) {
        message = "Location request timed out. Please try again.";
      }

      uvMessageEl.textContent = message;
      hourlyGridEl.innerHTML = "<p>Use suburb search as a fallback.</p>";
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  );
}

useLocationBtn?.addEventListener("click", useBrowserLocation);

suburbForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const suburb = suburbInput.value.trim();

  if (!suburb) return;

  searchSuburbAndFetchUv(suburb);
});