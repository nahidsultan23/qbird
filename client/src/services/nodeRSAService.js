const NodeRSA = require('node-rsa');

const publicKey = new NodeRSA('-----BEGIN PUBLIC KEY-----MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0p9nmQLB/4tCGWkaD1LLRpVXVvAkUyPWLefDlBTuPhSPCaR/Y5Gz4E6TTMsjUweXSuenr6sPnPeNZy7prtvkNr8R24TunBy+aMsKuW1GJ2Cq+s1jAIGqusa+GVypgM5e3HDvTcAhSXw5ZwIUYW1wacIkCb4912fV9dWRW1Tlh43hS9Ge1px58+LrG+n3c9s8C+uv10agkf5P86DmHk8vKLCmKsZL61mjJv9FH0fCmZ/yr4qHyLmNEF6wxxr/uNsBWqQ2r0X3EZ84Uw/vVL/ddava8qMT9y1W+KxVAUJ6yKv/MtMClAXJbK0U4ps5/REZEA8Px4pEL5yAB5VxTtCB3QIDAQAB-----END PUBLIC KEY-----');
const signatureKey = new NodeRSA('-----BEGIN PRIVATE KEY-----MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCfBOs53lIXBTDPJrlplW40RCg8lHcy3m1ZUBdRROyFziC46d7yigoXWESrWPb6OGlJDjI9w+VSL8FrrBKhI1M7JH1aDUGzguiHR/pQUx0tkvgs9Mf0EFTP8alO0M1rWkomxNtVM6YudPobibkHOzAvNPNYoj1SvkYg/rR5R56p6lzSHnZuQB3RyWQAqsyUdBljk7aTw73bOc+FDDk1025qtsBsvBoHVsluhQXVFivQEnrqr90W3UP3vQFR/YZ7pUiNK7DStCdvXgmmrayGYPz82ICfFQXoQI21g8p2AdOR6YXexmgSlj+YWY4Qpzp7zoy3RisZLVQRpD8effVb860/AgMBAAECggEAZkwTxrZuuMBuFdUjkfi/XIA8IjygMelFDx+m4HEmdy2Tf2F0OzLyKvJtuo0Q1QdVM9oeF/3dmHGATHP1yBOhh3qB6Vx9161vSRfUv7e4HYlefg06VJfs95jPAhTxEQ6UhTw+nSEM1vYJr415ql05MiUuJua37HLbSn6QOzUHrOZB2HMmSzP+rCdz8HopKn3VxxJ595QBiq8W8e7yOvFEgjXCFPVp+b28aTO0KNTCPMl/81FDLTHFYy2gXoup6NAzaYlXDOHhupztr8EGjCmgr061FcRKyy57DJ3dqgD7PZf5l3nggxiU6apzcHfezfI9pGt9KJmDNhWNTXNWVDX4AQKBgQDmH3yh4SeTZUyutqvv/9+ci/o3wRA7552nPYoRjmOv0SK9wEH2a9MZT3un4Dede2hyLRfMwfr7YvPrloGmb5HMiQ2BAjOjBkwG3/k5xL8eMFUC+L2y6Jp6/s4HTAtp2Vi7LtiM+5ibmYHqFLjIBrycFpLD2Xd5RPs8TxgkRITwwQKBgQCw5pQ8g/+DIueToC6zKid6xaxWP7hPV6yp4EugWyZMtvQRw7+cRwp//O9YiXXaryPiezsMW463NY56y6KvcXF0eeNO3akiytCsVFzf4IavuORsbShlREey8y7A4bA8dLuXyDJM+OpCJebpSRmWd0xbKjcJeIE5Cn5v5UDgGsId/wKBgQC4KNSVu9jvFS9D1n5Mh6mM31x0B/YU6qt47j+zAw914Vj7H4PqT6nVZI1h8IaxadRRIxMb0tUnHq5zh7Pj3P+B/uAmsPtf6KcpDU6m03PbFfTCdwtgxNLzwTxiDJJJuB1RVxEH6kTbqQKVsNWbhgCkrU/wmfUJwJGKVwXL6GW3QQKBgA3LDMfjKusYr6HNHZcOtGFYRGW9NivJlEbynDL2qHfW1BUGhEw1JdZw7GCk5zGT8mJYZXRDN0+Ft4RPmHHBkK0aS+T8V5HE6pxlP5CdOyM8cWMa58ltl4GWgJC9iDZOi8n77CAgUHOz7NtHvd0DlEqPchck9D50WQN0hqhyrawVAoGBAJq1wIly7kNqS8BZTkrcbQXQz7jRoMwabJ93P7iVxxXfiA5iXBf73dNQBeKHgezA6zNN32WS6goJwNQgi0M14ZRwn31ku1czgmNKY1quoq86X5C8t5BghK4NXzZDPae0d9RJ45+SvkXkfvqONCg98PAwsjgRpsZosD71SvnO6Eeg-----END PRIVATE KEY-----');
export function encryptedPassword(plainText) {
    return publicKey.encrypt(plainText, 'base64', 'utf8');
}

export function signedPassword(encryptedText) {
    return signatureKey.sign(encryptedText, 'base64', 'utf8');
}