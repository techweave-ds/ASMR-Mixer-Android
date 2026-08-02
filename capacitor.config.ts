import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.noctune.android",
  appName: "Noctune",
  webDir: "www",
  android: {
    backgroundColor: "#0b1020",
  },
  server: {
    androidScheme: "https",
    cleartext: false,
  },
};

export default config;
