const nodemailer = require("nodemailer")

const sendEmail = async ({ toMail, subject, emailHtml }) => {
    try {
        // Create a transporter
        const transporter = nodemailer.createTransport({
            service: "smtp.gmail.com",
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: process.env.MAIL,
                pass: process.env.PASSWORD,
            },
        });

        // Set up email options
        const mailOptions = {
            from: `Vaaidhya Healthcare <${process.env.MAIL}>`,
            to: toMail,
            subject: subject,
            html: emailHtml,
        };

        // Send the email
        const info = await transporter.sendMail(mailOptions);
        return info;
    } catch (error) {
        throw new Error(JSON.stringify(error));
    }
};

module.exports = { sendEmail }
