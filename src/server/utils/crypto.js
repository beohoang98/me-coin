const crypto = require("crypto");

function checkKeyPair({ publicKey, privateKey }) {
  const message = "sign me";
  try {
    const signature = crypto
      .createSign("SHA256")
      .update(message)
      .sign(privateKey);
    return crypto
      .createVerify("SHA256")
      .update(message)
      .verify(publicKey, signature);
  } catch {
    return false;
  }
}

function generateKeyPair() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
    },
  });
  return {
    publicKey,
    privateKey,
  };
}

module.exports = {
  checkKeyPair,
  generateKeyPair,
};
