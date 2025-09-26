import CryptoJS from 'crypto-js'

// Use a fixed key for browser-based encryption
// In production, consider using a more secure approach
const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'qmemory-encryption-key-2024'

export function encryptApiKey(apiKey: string): string {
  try {
    const encrypted = CryptoJS.AES.encrypt(apiKey, ENCRYPTION_KEY).toString()
    return encrypted
  } catch (error) {
    console.error('Encryption failed:', error)
    throw new Error('Failed to encrypt API key')
  }
}

export function decryptApiKey(encryptedKey: string): string {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedKey, ENCRYPTION_KEY)
    return decrypted.toString(CryptoJS.enc.Utf8)
  } catch (error) {
    console.error('Decryption failed:', error)
    throw new Error('Failed to decrypt API key')
  }
}