const sgMail = require('@sendgrid/mail')


sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name, code) => {
    sgMail.send({
        to: email,
        from: process.env.EMAIL,
        subject: 'Welcome Email',
        text: `Hello ${name}. We are glad to have you in Ehjezly App. Please Authorize your email by entering this code number:
        ${code}`
    })
}

const sendResetPasswordCode = (email, name, code) => {
    sgMail.send({
        to: email,
        from: process.env.EMAIL,
        subject: 'Reset Password',
        text: `Hello ${name}. Please Enter this code in order to reset your password: 
        ${code}`
    })
}

const sendCancelationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: process.env.EMAIL,
        subject: 'Cancelation Email',
        text: `Good Bye ${name}`
    })
}

module.exports ={
    sendWelcomeEmail,
    sendCancelationEmail,
    sendResetPasswordCode
}
