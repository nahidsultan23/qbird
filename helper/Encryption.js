const NodeRSA = require('node-rsa'); 
const publicKey = new NodeRSA('-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0p9nmQLB/4tCGWkaD1LLRpVXVvAkUyPWLefDlBTuPhSPCaR/Y5Gz4E6TTMsjUweXSuenr6sPnPeNZy7prtvkNr8R24TunBy+aMsKuW1GJ2Cq+s1jAIGqusa+GVypgM5e3HDvTcAhSXw5ZwIUYW1wacIkCb4912fV9dWRW1Tlh43hS9Ge1px58+LrG+n3c9s8C+uv10agkf5P86DmHk8vKLCmKsZL61mjJv9FH0fCmZ/yr4qHyLmNEF6wxxr/uNsBWqQ2r0X3EZ84Uw/vVL/ddava8qMT9y1W+KxVAUJ6yKv/MtMClAXJbK0U4ps5/REZEA8Px4pEL5yAB5VxTtCB3QIDAQAB\n-----END PUBLIC KEY-----');
const privateKey = new NodeRSA('-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDSn2eZAsH/i0IZaRoPUstGlVdW8CRTI9Yt58OUFO4+FI8JpH9jkbPgTpNMyyNTB5dK56evqw+c941nLumu2+Q2vxHbhO6cHL5oywq5bUYnYKr6zWMAgaq6xr4ZXKmAzl7ccO9NwCFJfDlnAhRhbXBpwiQJvj3XZ9X11ZFbVOWHjeFL0Z7WnHnz4usb6fdz2zwL66/XRqCR/k/zoOYeTy8osKYqxkvrWaMm/0UfR8KZn/KviofIuY0QXrDHGv+42wFapDavRfcRnzhTD+9Uv911q9ryoxP3LVb4rFUBQnrIq/8y0wKUBclsrRTimzn9ERkQDw/HikQvnIAHlXFO0IHdAgMBAAECggEAKSCBPSqBsSGDJa0VLprPIJg2tr4riaR8xPf1g6vWnX6sM4jQayPfSNRvBNbBrgvUagb0AmRXpyHblaNedAtx85K5rPC3Gvqt346OKIkC4tuIZ3LFeyrWqKP4KMGkQ4eIlGjlAXybw1qjZs7MJf4VrkD/gnuIXdBjwh4SxQ+9xgr+Vf9KyDJEADSpQyqWOwjQMqNz/5J8Dl3tQrD69eABBMkndpx4XkBX3yxmy9URRG43KFkmJTHycznX6v3tLBbmwmp7v78i6zICZXSp2/6YhPcDlcEJNQ3u2vq/6lv9IJXYXSmOC6p5Xo6Gg6eumwze9o/uysu0E2ft20FgfiAqQQKBgQD7GXu2esmkVz6P9k4dw4lyHEQcgn7UnSbwn4wsZVBYoq2DvzY4Tyhv+XXHPItyjUr4YU/+FV2EXpCIAtljTmh72k98RkHjRQnnbAkz4JsmGSVztl3Ox/9ZP2YASvyvad9EoC5LPm6KJOhpB2nHsPSHCWQ1lYhET0YRsRv5+Cp7cQKBgQDWu7H5QLx8OLSSCxDKMVQvSnZ9w/8ydqHOqYQjeGaqGOc5EfaPn/BXnbfIf512pbK/ewNVyBUf20TneYB7gf3MEkziDg6RBZka5oZlVyClID1+w/1vJv6zqwoPEtD1EY/qYkYR3wM7VrveKhZ0dpJwEcWmyenbPtwTu50PPng/LQKBgAg71K+uJRCLf9Suqe8V61rfjGg26zvDj3RSdwE5rUHKy8/HJFsCVXwefPs0hAoUkgHFBx94yeE+TJT5KvGzr39oMDUOBLkUGXgKNd8KnWvJZU3/C+Js8nWVu52E1/ZUjWqtqfbzrCJBhZF0GcbfiZUn/K45IgfDZbPMz/MJbTMxAoGAOoj1zfVYrCAlEP6VOBjUUwPgYw4vncj6+MP68lRa4BljxongBWza7nde5vfqq7IllM7qrNKa95ElKlhTrtdToPKIJMMiM2QsRUn77toeWwT73nd8uXUOz1lbp5pAfd2otoLNiQea8O0Gz1v3vQ2pg4VEtN+rsQlkorhs6v/jdY0CgYBwrcq5SSN25CmxGmkFczNI1gLtTr+XaGZQQhn7K1h/YAe3tQkOuLM7qKMcWOYsoVMxTqhCKeHNfaYnLUZWThNqGWYwnIlFVs4xqVm3Pbp/5PESXJetRW5MsdlXe0IX/0anLwmrmVvGbGB0XWxokRd5nOtYBJWztZM9FTO5rFyUdw==\n-----END PRIVATE KEY-----'); 
const signCheckKey = new NodeRSA('-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAnwTrOd5SFwUwzya5aZVuNEQoPJR3Mt5tWVAXUUTshc4guOne8ooKF1hEq1j2+jhpSQ4yPcPlUi/Ba6wSoSNTOyR9Wg1Bs4Loh0f6UFMdLZL4LPTH9BBUz/GpTtDNa1pKJsTbVTOmLnT6G4m5BzswLzTzWKI9Ur5GIP60eUeeqepc0h52bkAd0clkAKrMlHQZY5O2k8O92znPhQw5NdNuarbAbLwaB1bJboUF1RYr0BJ66q/dFt1D970BUf2Ge6VIjSuw0rQnb14Jpq2shmD8/NiAnxUF6ECNtYPKdgHTkemF3sZoEpY/mFmOEKc6e86Mt0YrGS1UEaQ/Hn31W/OtPwIDAQAB\n-----END PUBLIC KEY-----');
const signatureKey = new NodeRSA('-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCfBOs53lIXBTDPJrlplW40RCg8lHcy3m1ZUBdRROyFziC46d7yigoXWESrWPb6OGlJDjI9w+VSL8FrrBKhI1M7JH1aDUGzguiHR/pQUx0tkvgs9Mf0EFTP8alO0M1rWkomxNtVM6YudPobibkHOzAvNPNYoj1SvkYg/rR5R56p6lzSHnZuQB3RyWQAqsyUdBljk7aTw73bOc+FDDk1025qtsBsvBoHVsluhQXVFivQEnrqr90W3UP3vQFR/YZ7pUiNK7DStCdvXgmmrayGYPz82ICfFQXoQI21g8p2AdOR6YXexmgSlj+YWY4Qpzp7zoy3RisZLVQRpD8effVb860/AgMBAAECggEAZkwTxrZuuMBuFdUjkfi/XIA8IjygMelFDx+m4HEmdy2Tf2F0OzLyKvJtuo0Q1QdVM9oeF/3dmHGATHP1yBOhh3qB6Vx9161vSRfUv7e4HYlefg06VJfs95jPAhTxEQ6UhTw+nSEM1vYJr415ql05MiUuJua37HLbSn6QOzUHrOZB2HMmSzP+rCdz8HopKn3VxxJ595QBiq8W8e7yOvFEgjXCFPVp+b28aTO0KNTCPMl/81FDLTHFYy2gXoup6NAzaYlXDOHhupztr8EGjCmgr061FcRKyy57DJ3dqgD7PZf5l3nggxiU6apzcHfezfI9pGt9KJmDNhWNTXNWVDX4AQKBgQDmH3yh4SeTZUyutqvv/9+ci/o3wRA7552nPYoRjmOv0SK9wEH2a9MZT3un4Dede2hyLRfMwfr7YvPrloGmb5HMiQ2BAjOjBkwG3/k5xL8eMFUC+L2y6Jp6/s4HTAtp2Vi7LtiM+5ibmYHqFLjIBrycFpLD2Xd5RPs8TxgkRITwwQKBgQCw5pQ8g/+DIueToC6zKid6xaxWP7hPV6yp4EugWyZMtvQRw7+cRwp//O9YiXXaryPiezsMW463NY56y6KvcXF0eeNO3akiytCsVFzf4IavuORsbShlREey8y7A4bA8dLuXyDJM+OpCJebpSRmWd0xbKjcJeIE5Cn5v5UDgGsId/wKBgQC4KNSVu9jvFS9D1n5Mh6mM31x0B/YU6qt47j+zAw914Vj7H4PqT6nVZI1h8IaxadRRIxMb0tUnHq5zh7Pj3P+B/uAmsPtf6KcpDU6m03PbFfTCdwtgxNLzwTxiDJJJuB1RVxEH6kTbqQKVsNWbhgCkrU/wmfUJwJGKVwXL6GW3QQKBgA3LDMfjKusYr6HNHZcOtGFYRGW9NivJlEbynDL2qHfW1BUGhEw1JdZw7GCk5zGT8mJYZXRDN0+Ft4RPmHHBkK0aS+T8V5HE6pxlP5CdOyM8cWMa58ltl4GWgJC9iDZOi8n77CAgUHOz7NtHvd0DlEqPchck9D50WQN0hqhyrawVAoGBAJq1wIly7kNqS8BZTkrcbQXQz7jRoMwabJ93P7iVxxXfiA5iXBf73dNQBeKHgezA6zNN32WS6goJwNQgi0M14ZRwn31ku1czgmNKY1quoq86X5C8t5BghK4NXzZDPae0d9RJ45+SvkXkfvqONCg98PAwsjgRpsZosD71SvnO6Eeg\n-----END PRIVATE KEY-----');

const encrypt = (msg) => {
    if(!msg)
        return msg;

    return publicKey.encrypt(msg, 'base64', 'utf8');
}

const sign = (encryptedMsg) => {
    if(!encryptedMsg)
        return encryptedMsg;

    return signatureKey.sign(encryptedMsg, 'base64', 'utf8');;
}

const decrypt = (encryptedMsg) => {
    if(!encryptedMsg)
        return encryptedMsg;

    return privateKey.decrypt(encryptedMsg, 'utf8', 'base64');
}

const verifySignature = (encryptedMsg,signature) => {
    if(!encryptedMsg || !signature)
        return false;

    return signCheckKey.verify(encryptedMsg, signature, 'utf8', 'base64');
}

module.exports = {
    encrypt: encrypt,
    decrypt: decrypt,
    sign: sign,
    verifySignature: verifySignature
};