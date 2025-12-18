/**
 * Main Application Logic
 * Handles device discovery and connection
 * Following the official Ledger docs:
 * https://developers.ledger.com/docs/device-interaction/beginner/discover_and_connect
 */

import { dmk } from "./dmk.js";

// DOM Elements
const connectBtn = document.getElementById("connectBtn");
const disconnectBtn = document.getElementById("disconnectBtn");
const statusEl = document.getElementById("status");
const deviceInfoEl = document.getElementById("deviceInfo");
const deviceModelEl = document.getElementById("deviceModel");
const sessionIdEl = document.getElementById("sessionId");

// State
let discoverySubscription = null;
let currentSessionId = null;

/**
 * Update the UI status display
 */
function setStatus(message, type = "idle") {
  statusEl.className = `status-${type}`;
  
  if (type === "searching") {
    statusEl.innerHTML = `<div class="loader"></div>${message}`;
  } else {
    statusEl.textContent = message;
  }
}

// Hacker-style status messages
const STATUS_MESSAGES = {
  idle: "awaiting_connection...",
  searching: "scanning_devices...",
  found: "device_detected // establishing_link...",
  connected: "connection_established // access_granted",
  disconnected: "session_terminated // ready",
  timeout: "scan_timeout // no_device_found",
  error: "error // connection_failed"
};

/**
 * Show device info panel
 */
function showDeviceInfo(model, sessionId) {
  deviceModelEl.textContent = model.toLowerCase();
  sessionIdEl.textContent = sessionId.slice(0, 12) + "...";
  deviceInfoEl.style.display = "block";
  disconnectBtn.style.display = "inline-block";
}

/**
 * Hide device info panel
 */
function hideDeviceInfo() {
  deviceInfoEl.style.display = "none";
  disconnectBtn.style.display = "none";
}

/**
 * Start discovering and connect to the first device found
 * This follows the official DMK documentation pattern
 */
async function startDiscovery() {
  // Disable button during discovery
  connectBtn.disabled = true;
  setStatus(STATUS_MESSAGES.searching, "searching");

  try {
    // Start discovering devices - this returns an Observable
    // Pass empty object {} as required by the API
    discoverySubscription = dmk.startDiscovering({}).subscribe({
      next: async (device) => {
        console.log("[DMK] device_discovered:", device);
        setStatus(STATUS_MESSAGES.found, "searching");

        // Stop discovery once we find a device
        stopDiscovery();

        try {
          // Connect to the discovered device
          // API expects { device } not { deviceId }
          const sessionId = await dmk.connect({ device });
          currentSessionId = sessionId;

          console.log("[DMK] session_established:", sessionId);
          setStatus(STATUS_MESSAGES.connected, "connected");

          // Get device info
          const connectedDevice = dmk.getConnectedDevice({ sessionId });
          const modelName = connectedDevice.modelId || "unknown_model";
          
          showDeviceInfo(modelName, sessionId);
          connectBtn.disabled = false;
          connectBtn.textContent = "[ RECONNECT ]";
        } catch (connectError) {
          console.error("[DMK] error:", connectError);
          setStatus(`${STATUS_MESSAGES.error} // ${connectError.message}`, "error");
          connectBtn.disabled = false;
        }
      },
      error: (error) => {
        console.error("[DMK] discovery_error:", error);
        setStatus(`${STATUS_MESSAGES.error} // ${error.message}`, "error");
        connectBtn.disabled = false;
      },
      complete: () => {
        console.log("[DMK] discovery_complete");
      },
    });

    // Auto-stop discovery after 30 seconds if no device found
    setTimeout(() => {
      if (discoverySubscription && !currentSessionId) {
        stopDiscovery();
        setStatus(STATUS_MESSAGES.timeout, "error");
        connectBtn.disabled = false;
      }
    }, 30000);

  } catch (error) {
    console.error("[DMK] fatal_error:", error);
    setStatus(`${STATUS_MESSAGES.error} // ${error.message}`, "error");
    connectBtn.disabled = false;
  }
}

/**
 * Stop the device discovery process
 */
function stopDiscovery() {
  if (discoverySubscription) {
    discoverySubscription.unsubscribe();
    discoverySubscription = null;
    console.log("Discovery stopped");
  }
}

/**
 * Disconnect from the current device
 */
async function disconnect() {
  if (currentSessionId) {
    try {
      await dmk.disconnect({ sessionId: currentSessionId });
      console.log("[DMK] session_terminated");
    } catch (error) {
      console.error("[DMK] disconnect_error:", error);
    }
    currentSessionId = null;
  }
  
  hideDeviceInfo();
  setStatus(STATUS_MESSAGES.disconnected, "idle");
  connectBtn.textContent = "[ CONNECT ]";
}

// Event Listeners
connectBtn.addEventListener("click", startDiscovery);
disconnectBtn.addEventListener("click", disconnect);

// Log that the app is ready
console.log("%c[LEDGER_DMK] system_initialized", "color: #ff00ff; font-weight: bold");
console.log("%c[LEDGER_DMK] awaiting_user_input...", "color: #00ffff");
