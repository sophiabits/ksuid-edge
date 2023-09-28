function getCrypto() {
  if (typeof crypto === 'undefined') {
    return require('node:crypto').webcrypto as Crypto;
  }

  return crypto;
}

export default getCrypto();
