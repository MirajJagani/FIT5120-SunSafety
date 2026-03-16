const preventionUseLocationBtn = document.getElementById("prevention-use-location-btn");
const preventionSuburbForm = document.getElementById("prevention-suburb-form");
const preventionSuburbInput = document.getElementById("prevention-suburb-input");

const preventionLocationNameEl = document.getElementById("prevention-location-name");
const preventionUvIndexValueEl = document.getElementById("prevention-uv-index-value");
const preventionUvIndexCircleEl = document.getElementById("prevention-uv-index-circle");
const preventionRiskPillEl = document.getElementById("prevention-risk-pill");
const preventionUvMessageEl = document.getElementById("prevention-uv-message");
const preventionLastUpdatedEl = document.getElementById("prevention-last-updated");
const preventionAdviceListEl = document.getElementById("prevention-advice-list");

function getPreventionDetails(uv) {
  if (uv < 3) {
    return {
      label: "Low",
      colorClass: "uv-low",
      message: "Low UV. Minimal protection needed, but basic protection is still a good idea.",
      actions: [
        "Wear sunglasses if the sunlight feels strong.",
        "Use sunscreen if you stay outdoors for a long time.",
        "A hat and light protective clothing are still helpful."
      ]
    };
  }

  if (uv < 6) {
    return {
      label: "Moderate",
      colorClass: "uv-moderate",
      message: "Moderate UV. Protection is recommended.",
      actions: [
        "Slip on protective clothing that covers your skin.",
        "Slop on SPF50+ sunscreen before going outside.",
        "Slap on a wide-brim hat.",
        "Seek shade during the middle of the day.",
        "Slide on sunglasses."
      ]
    };
  }

  if (uv < 8) {
    return {
      label: "High",
      colorClass: "uv-high",
      message: "High UV. Protection is needed now.",
      actions: [
        "Wear long-sleeved or UPF clothing.",
        "Apply SPF50+ sunscreen and reapply every 2 hours.",
        "Wear a broad-brim hat.",
        "Stay in the shade whenever possible.",
        "Use sunglasses with UV protection."
      ]
    };
  }

  if (uv < 11) {
    return {
      label: "Very High",
      colorClass: "uv-very-high",
      message: "Very high UV. Extra protection is needed.",
      actions: [
        "Reduce time in direct sunlight, especially around midday.",
        "Wear covering clothing and a broad-brim hat.",
        "Use SPF50+ sunscreen on all exposed skin.",
        "Seek deep shade or indoor cover when possible.",
        "Wear wraparound sunglasses."
      ]
    };
  }

  return {
    label: "Extreme",
    colorClass: "uv-extreme",
    message: "Extreme UV. Avoid direct sun exposure if possible.",
    actions: [
      "Stay indoors or in deep shade during peak UV hours.",
      "Cover up with full protective clothing.",
      "Apply SPF50+ sunscreen generously and often.",
      "Wear a broad-brim hat and sunglasses.",
      "Delay outdoor activity if possible."
    ]
  };
}

function resetPreventionUvClasses() {
  preventionUvIndexCircleEl.classList.remove(
    "uv-low",
    "uv-moderate",
    "uv-high",
    "uv-very-high",
    "uv-extreme"
  );

  preventionRiskPillEl.classList.remove(
    "uv-low",
    "uv-moderate",
    "uv-high",
    "uv-very-high",
    "uv-extreme"
  );
}

function renderPreventionResult(locationLabel, currentUv, currentTime) {
  const roundedUv = Number(currentUv).toFixed(1);
  const details = getPreventionDetails(Number(currentUv));

  preventionLocationNameEl.textContent = locationLabel;
  preventionUvIndexValueEl.textContent = roundedUv;
  preventionRiskPillEl.textContent = details.label;
  preventionUvMessageEl.textContent = details.message;
  preventionLastUpdatedEl.textContent = new Date(currentTime).toLocaleString();

  resetPreventionUvClasses();
  preventionUvIndexCircleEl.classList.add(details.colorClass);
  preventionRiskPillEl.classList.add(details.colorClass);

  preventionAdviceListEl.innerHTML = "";

  details.actions.forEach((action) => {
    const li = document.createElement("li");
    li.textContent = action;
    preventionAdviceListEl.appendChild(li);
  });
}

async function fetchPreventionUv(latitude, longitude, locationLabel) {
  try {
    preventionLocationNameEl.textContent = locationLabel || "Fetching location...";
    preventionUvIndexValueEl.textContent = "--";
    preventionRiskPillEl.textContent = "Loading...";
    preventionUvMessageEl.textContent = "Loading prevention advice...";
    preventionLastUpdatedEl.textContent = "--";
    preventionAdviceListEl.innerHTML = "<li>Loading actions...</li>";

    const endpoint = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=uv_index&timezone=auto&forecast_hours=1`;

    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error("Failed to fetch UV data.");
    }

    const data = await response.json();

    const currentUv = data.current?.uv_index;
    const currentTime = data.current?.time;

    if (currentUv === undefined) {
      throw new Error("UV data unavailable for this location.");
    }

    renderPreventionResult(locationLabel, currentUv, currentTime);
  } catch (error) {
    resetPreventionUvClasses();
    preventionLocationNameEl.textContent = locationLabel || "Location unavailable";
    preventionUvIndexValueEl.textContent = "--";
    preventionRiskPillEl.textContent = "Unavailable";
    preventionUvMessageEl.textContent = error.message;
    preventionLastUpdatedEl.textContent = "--";
    preventionAdviceListEl.innerHTML = "<li>Could not load advice.</li>";
  }
}

async function searchSuburbAndFetchPreventionUv(query) {
  try {
    preventionLocationNameEl.textContent = "Searching...";
    preventionUvMessageEl.textContent = "Looking up suburb...";
    preventionAdviceListEl.innerHTML = "<li>Loading actions...</li>";

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

    await fetchPreventionUv(place.latitude, place.longitude, locationLabel);
  } catch (error) {
    resetPreventionUvClasses();
    preventionLocationNameEl.textContent = "Search failed";
    preventionUvIndexValueEl.textContent = "--";
    preventionRiskPillEl.textContent = "Unavailable";
    preventionUvMessageEl.textContent = error.message;
    preventionLastUpdatedEl.textContent = "--";
    preventionAdviceListEl.innerHTML = "<li>Try another suburb or use your location.</li>";
  }
}

function useBrowserLocationForPrevention() {
  if (!navigator.geolocation) {
    preventionUvMessageEl.textContent = "Geolocation is not supported in this browser.";
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;
      await fetchPreventionUv(latitude, longitude, "Your current location");
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

      preventionUvMessageEl.textContent = message;
      preventionAdviceListEl.innerHTML = "<li>Use suburb search as a fallback.</li>";
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  );
}

preventionUseLocationBtn?.addEventListener("click", useBrowserLocationForPrevention);

preventionSuburbForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const suburb = preventionSuburbInput.value.trim();

  if (!suburb) return;

  searchSuburbAndFetchPreventionUv(suburb);
});