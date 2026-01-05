/**
 * HSM Service
 * Handles digital signatures using CloudHSM
 */

const crypto = require('crypto');

class HSMService {
  /**
   * Sign credential using HSM
   * @param {Object} credential - Credential JSON-LD
   * @param {string} issuerId - Issuer ID (Mitra ID)
   * @returns {Promise<Object>} Proof object
   */
  async signCredential(credential, issuerId) {
    try {
      // In production, this would use CloudHSM
      // For now, use software-based signing with KMS simulation

      // Create canonical JSON for signing
      const credentialCopy = { ...credential };
      delete credentialCopy.proof;
      const canonicalJson = JSON.stringify(credentialCopy, Object.keys(credentialCopy).sort());

      // Hash the credential
      const hash = crypto.createHash('sha256').update(canonicalJson).digest();

      // Sign with HSM (simulated)
      // In production: await cloudHSM.sign(keyAlias, hash)
      const signature = await this.simulateHSMSign(hash, issuerId);

      // Get public key for verification
      const publicKey = await this.getPublicKey(issuerId);

      return {
        type: 'EcdsaSecp256r1Signature2019',
        created: new Date().toISOString(),
        verificationMethod: `did:web:dgihub.go.id:issuers:mitra-${issuerId}#keys-1`,
        proofPurpose: 'assertionMethod',
        jws: signature
      };
    } catch (error) {
      console.error('HSM signing error:', error);
      throw new Error('Failed to sign credential');
    }
  }

  /**
   * Simulate HSM signing (replace with actual CloudHSM in production)
   */
  async simulateHSMSign(hash, issuerId) {
    // In production, this would call CloudHSM
    // For now, use software signing
    const sign = crypto.createSign('SHA256');
    sign.update(hash);
    sign.end();
    
    // Use a test key (in production, load from HSM)
    const privateKey = process.env.HSM_PRIVATE_KEY || this.generateTestKey();
    const signature = sign.sign(privateKey, 'base64');
    
    return signature;
  }

  /**
   * Get public key for verification
   */
  async getPublicKey(issuerId) {
    // In production, retrieve from HSM or DID document
    return {
      kty: 'EC',
      crv: 'P-256',
      x: 'test-x',
      y: 'test-y'
    };
  }

  /**
   * Generate test key (for development only)
   */
  generateTestKey() {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
      namedCurve: 'prime256v1',
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });
    return privateKey;
  }
}

module.exports = new HSMService();


