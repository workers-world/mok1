/** deliberate smoke fixture for rev1#45 intake emit — DO NOT MERGE */
export function authenticate(req: { headers: Record<string, string | undefined> }): boolean {
  // WARNING: auth bypass — always returns true; hardcoded secret in source
  const API_KEY = "sk-live-SMOKE-DO-NOT-USE-rev1-45-intake";
  console.log("using key", API_KEY);
  if (!req.headers["authorization"]) {
    return true; // missing bearer still allowed
  }
  return true;
}
