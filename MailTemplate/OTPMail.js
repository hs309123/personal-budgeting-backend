const OTPMail = (OTP) => {
    return `
        <html>
            <body>
                <p>This is your OTP :${OTP}</p>
                <p>Valid For 5 minutes</p>
            </body>
        </html>
        `
}

module.exports = { OTPMail }
