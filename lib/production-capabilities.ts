// Backend workflows that are not exposed by the active production project.
// Keep false until RPC contracts, RLS, and end-to-end tests are deployed and verified.
export const productionCapabilities = {
  profileEditing: false,
  supportTickets: false,
  perTaskGuardianApproval: false,
} as const
