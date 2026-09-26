import "server-only";
import { Xendit } from "xendit-node";


// Server-only. Secret Key Xendit gak boleh pernah nyampe ke browser.
export function createXenditClient() {
  return new Xendit({ secretKey: process.env.XENDIT_SECRET_KEY! });
}
