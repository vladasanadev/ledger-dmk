/**
 * DMK Singleton Instance
 * Following the official Ledger docs:
 * https://developers.ledger.com/docs/device-interaction/beginner/init_dmk
 */

import {
  ConsoleLogger,
  DeviceManagementKitBuilder,
} from "@ledgerhq/device-management-kit";
import { webHidTransportFactory } from "@ledgerhq/device-transport-kit-web-hid";

// Initialize the DMK with a console logger and WebHID transport
// Important: The DMK should be initialized only once (singleton pattern)
export const dmk = new DeviceManagementKitBuilder()
  .addLogger(new ConsoleLogger())
  .addTransport(webHidTransportFactory) // Transport is required
  .build();

