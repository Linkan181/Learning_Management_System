import nodemailer from 'nodemailer';


const sendEmail=async function(email,subject, message){
    const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
            user: 'howell.monahan22@ethereal.email',
            pass: 'WdGWMnaXFHdmt8qKfF'
        }
    });



  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: 'maddison53@ethereal.email', // sender address
    to: 'bar@example.com, baz@example.com', // list of receivers
    subject: subject, // Subject line
    text: message, // plain text body
    html: message, // html body
  });

  

}

export default sendEmail;

