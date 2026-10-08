import express from 'express'
import Redis from 'ioredis'


const app = express();
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

app.use(express.json())

function otpKey(phone) {
    return `otp: ${phone}` //This is the key which we store in redis. Suppose we want to store a user's name 
    // so in redis we do   ---> user:101 =  name
    //Here we store otp in the way :
    //otp: 9112119233   = actualOtp

}

//Now we write the logic for the page(/otp) where user comes up ,
//  enters his number and presses send otp button 
app.post('/otp', async (req, res) => {
    const { phone } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await redis.set(otpKey(phone), otp, 'EX', 600);
    // This is how we store the otp in the redis with key otp:phoneNumber
    //  and expiry time of 60 seconds.This is the ttl for the otp
    res.json({ message: 'OTP Sent', otp });
})

// Then the user goes to verify the otp at /otp/verify route 
app.post('/otp/verify', async (req, res) => {
    const { phone, otp } = req.body;
    const savedOtp = await redis.get(otpKey(phone)) //If the otp entered by user is equal to 
    // the one stored in redis then it returns the  true other wis invalid . And no savedotp is found then it
    // means that this key name does not exist or the ttl of the key has been expired.
    if (!savedOtp) {
        return res.status(402).json({ message: 'Otp Expired or Not Found' })
    }
    if (savedOtp !== otp) {
        return res.status(401).json({ message: 'Invalid otp' });
    }
    else {
        await redis.del(otpKey(phone));//after successful verification we delete the 
        //otp from the redis so that it cannot be used again
        return res.status(200).json({ message: 'Otp verified succesfully' });
    }
})


// Now another important thing which we require sometimes is to check the ttl of the otp
// that is the remaining time of the otp
app.get('/otp/:phone/ttl', async (req, res) => {
    const ttl = await redis.ttl(otpKey(req.params.phone));
    res.json({ ttl });
})

app.listen(3000, () => {
    console.log("Server running on port https://localhost:3000 ");
})
