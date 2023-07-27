function getCrypto() {
  if (typeof crypto === 'undefined') {
    return require('crypto').webcrypto as Crypto;
  }

  return crypto;
}

export default getCrypto();
