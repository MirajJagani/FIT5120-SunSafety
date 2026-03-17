const useLocationBtn = document.getElementById("use-location-btn");
const suburbForm = document.getElementById("suburb-form");
const suburbInput = document.getElementById("suburb-input");

const locationNameEl = document.getElementById("location-name");
const uvIndexValueEl = document.getElementById("uv-index-value");
const uvIndexCircleEl = document.getElementById("uv-index-circle");
const riskPillEl = document.getElementById("risk-pill");
const uvMessageEl = document.getElementById("uv-message");
const uvDamageTimeEl = document.getElementById("uv-damage-time");
const lastUpdatedEl = document.getElementById("last-updated");
const hourlyGridEl = document.getElementById("hourly-grid");
const preventionLinkBox = document.getElementById("prevention-link-box");

const uvTrendChartEl = document.getElementById("uv-trend-chart");

let uvTrendChartInstance = null;

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

function getHumanProtectionWindow(uv) {
  if (uv < 3) {
    return "Unprotected skin damage is less likely right now, but protection is still smart for long outdoor exposure.";
  }

  if (uv < 6) {
    return "Unprotected lighter skin may start getting damaged in around 45–60 minutes.";
  }

  if (uv < 8) {
    return "Unprotected lighter skin may start getting damaged in around 25–35 minutes.";
  }

  if (uv < 11) {
    return "Unprotected lighter skin may start getting damaged in around 15–20 minutes.";
  }

  return "Unprotected lighter skin may start getting damaged in under 10–15 minutes.";
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

function saveLatestUvResult(locationLabel, currentUv, currentTime, risk) {
  const latestUvResult = {
    location: locationLabel,
    uv: Number(currentUv),
    updatedAt: currentTime,
    riskLabel: risk.label,
    message: risk.message
  };

  localStorage.setItem("latestUvResult", JSON.stringify(latestUvResult));
}

function renderUvTrendChart(hourlyTimes, hourlyUvValues) {
  if (!uvTrendChartEl || typeof Chart === "undefined") return;

  const labels = hourlyTimes.slice(0, 6).map((time) => formatHour(time));
  const values = hourlyUvValues.slice(0, 6).map((uv) => Number(uv).toFixed(1));

  if (uvTrendChartInstance) {
    uvTrendChartInstance.destroy();
  }

  uvTrendChartInstance = new Chart(uvTrendChartEl, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "UV Index",
          data: values,
          borderWidth: 3,
          tension: 0.35,
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: true
        },
        tooltip: {
          callbacks: {
            label(context) {
              return `UV ${context.parsed.y}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          suggestedMax: 12,
          title: {
            display: true,
            text: "UV Index"
          }
        },
        x: {
          title: {
            display: true,
            text: "Time"
          }
        }
      }
    }
  });
}

function renderUvResult(locationLabel, currentUv, currentTime, hourlyTimes, hourlyUvValues) {
  const roundedUv = Number(currentUv).toFixed(1);
  const risk = getUvRiskDetails(Number(currentUv));
  const damageWindowMessage = getHumanProtectionWindow(Number(currentUv));

  locationNameEl.textContent = locationLabel;
  uvIndexValueEl.textContent = roundedUv;
  riskPillEl.textContent = risk.label;
  uvMessageEl.textContent = risk.message;
  uvDamageTimeEl.textContent = damageWindowMessage;
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

  renderUvTrendChart(hourlyTimes, hourlyUvValues);
  saveLatestUvResult(locationLabel, currentUv, currentTime, risk);

  if (preventionLinkBox) {
    preventionLinkBox.classList.remove("prevention-hidden");
  }
}

async function fetchUvByCoordinates(latitude, longitude, locationLabel) {
  try {
    locationNameEl.textContent = locationLabel || "Fetching location...";
    uvIndexValueEl.textContent = "--";
    riskPillEl.textContent = "Loading...";
    uvMessageEl.textContent = "Loading live UV data...";
    uvDamageTimeEl.textContent = "--";
    lastUpdatedEl.textContent = "--";
    hourlyGridEl.innerHTML = "<p>Loading forecast...</p>";

    if (preventionLinkBox) {
      preventionLinkBox.classList.add("prevention-hidden");
    }

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
    uvDamageTimeEl.textContent = "--";
    lastUpdatedEl.textContent = "--";
    hourlyGridEl.innerHTML = "<p>Could not load forecast.</p>";

    if (preventionLinkBox) {
      preventionLinkBox.classList.add("prevention-hidden");
    }
  }
}

async function searchSuburbAndFetchUv(query) {
  try {
    locationNameEl.textContent = "Searching...";
    uvMessageEl.textContent = "Looking up suburb...";
    uvDamageTimeEl.textContent = "--";
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
    uvDamageTimeEl.textContent = "--";
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
      uvDamageTimeEl.textContent = "--";
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