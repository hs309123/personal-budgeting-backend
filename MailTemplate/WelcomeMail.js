const WelcomeMail = (name) => {
    return `
        <html>
            <body>
                <p>Thank you for signing up with us ${name}</p>
            </body>
        </html>
        `
}

module.exports = { WelcomeMail }
