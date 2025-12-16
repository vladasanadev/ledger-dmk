// index.js
import { DeviceManagementKitBuilder } from '@ledgerhq/device-management-kit';

// Step 1: Create the DMK instance
const dmk = DeviceManagementKitBuilder()
  .addTransport('usb') // Support USB connections
  .build();

// Step 2: Discover connected devices
async function discoverDevices() {
  console.log('Looking for Ledger devices...');
  
  const devices = await dmk.discoverDevices();
  
  if (devices.length === 0) {
    console.log('No devices found. Plug in your Ledger!');
    return;
  }
  
  console.log(`Found ${devices.length} device(s)`);
  return devices[0]; // Use the first one
}

// Step 3: Connect to a device
async function connectToDevice() {
  const device = await discoverDevices();
  
  if (!device) return;
  
  console.log('Connecting to device...');
  const session = await dmk.connect(device.id);
  
  console.log('Connected!');
  return session;
}

// Run it
connectToDevice()
  .then(() => console.log('Success'))
  .catch(err => console.error('Error:', err));