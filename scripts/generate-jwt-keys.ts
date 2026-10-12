// ============================================================================
// RS256 Key Pair Generator — Phase 2C
// ============================================================================
// Generates a 2048-bit RSA key pair for JWT signing (RS256).
//
// Usage:
//   npx tsx scripts/generate-jwt-keys.ts
//
// Outputs:
//   - Private key (PEM) → store in env var JWT_PRIVATE_KEY (KEEP SECRET)
//   - Public key (PEM) → store in lib/license/public-key.ts as a string constant
//
// SECURITY: The private key MUST be stored in an environment variable or
// secrets manager. NEVER commit it to the repository.
// ============================================================================

import { generateKeyPairSync } from "node:crypto"

function main() {
  console.log("🔐 Generating RS256 key pair (RSA 2048-bit)...\n")

  const { publicKey, privateKey } = generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
    },
  })

  console.log("===== PUBLIC KEY (lib/license/public-key.ts) =====")
  console.log("Copy the following into the PUBLIC_KEY constant:\n")
  console.log(publicKey)
  console.log("\n===== PRIVATE KEY (env var JWT_PRIVATE_KEY) =====")
  console.log("Set this as the JWT_PRIVATE_KEY environment variable.")
  console.log("KEEP IT SECRET. NEVER commit it.\n")
  console.log(privateKey)

  console.log("✅ Done. Key pair generated.")
  console.log("\nNext steps:")
  console.log("  1. Copy the public key into lib/license/public-key.ts")
  console.log("  2. Set JWT_PRIVATE_KEY=<private-key> in your .env file")
  console.log("  3. Add JWT_PRIVATE_KEY to .gitignore if not already there")
}

main()