export const ADMIN_CREDENTIALS = {
  rootNumber: "873462837",
  password: "AK92839ajs2",
} as const;

export function validateAdminCredentials(
  rootNumber: string,
  password: string,
): boolean {
  return (
    rootNumber === ADMIN_CREDENTIALS.rootNumber &&
    password === ADMIN_CREDENTIALS.password
  );
}
