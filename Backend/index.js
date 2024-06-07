const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bycrypt = require('bcryptjs');
const User = require('./models/User');
const app = express();
const port = 5000;
const jwt = require('jsonwebtoken');

app.use(cors());
app.use(bodyParser.json());

const connect = require('./db/connection');
connect();



app.post('/register', async (req, res) => {
    try {
        console.log(req.body)
        const { Name, Email, Password } = req.body;
        if (!Name || !Email || !Password) {
            return res.status(400).json({ msg: "Please enter all fields" })
        }
        if (Password.length < 6) {
            return res.status(400).json({ msg: "Password should be  consist of 6 words" })
        }

        const isexist = await User.findOne({ Email })
        if (isexist) {
            return res.status(400).json({ msg: "User already exists" })
        }

        const newuser = new User({
            Name,
            Email,
            Password
        })
        bycrypt.genSalt(10, (_err, salt) => {
            bycrypt.hash(newuser.Password, salt, async (err, hash) => {
                if (err) throw err;
                newuser.Password = hash;
                const saveduser = await newuser.save();
                res.json({
                    id: saveduser.id,
                    name: saveduser.Name,
                    email: saveduser.Email
                });
            });
        });


    } catch (error) {
        res.status(400).json({ error: error.message })
    }
})

app.post('/login', async (req, res, _next) => {
    try {
        const { Email, Password } = req.body
        if (!Email || !Password) {
            res.status(400).send("Fill all fields")
        }
        else {
            const user = await User.findOne({ Email })
            if (!user) {
                res.status(400).send("User or password is wrong")
            }
            else {
                const validateuser = await bycrypt.compare(Password, user.Password)
                if (!validateuser) {
                    res.status(400).send("User or password is wrong")
                }
                else {
                    const payload = {
                        userId: user._id,
                        userEmail: user.Email
                    }
                    const jwtkey = 'this_is_a_secret_key_which_doesnt_need_to_be_exposed'
                    jwt.sign(payload, jwtkey, {
                        expiresIn: 84600
                    }, async (_err, token) => {
                        await User.updateOne({ _id: user.id, }, {
                            $set: { token }
                        })
                        user.save()
                        return res.status(200).json({ user: { id: user._id, name: user.Name, email: user.Email, points: user.Points }, token: token })
                    })
                }
            }
        }

    } catch (error) {
        console.error(error)
    }
})
// Endpoint to roll the dice
app.post('/roll', async (req, res) => {
    const { bet, choice, id } = req.body;

    if (!bet || !choice) {
        return res.status(400).send({ message: 'Please provide bet and choice' });
    }

    const user = await User.findById(id);
    let userPoints = user.Points;
    if (bet > userPoints) {
        return res.status(400).send({ message: 'Insufficient points' });
    }

    if (!user) {
        return res.status(400).send({ message: 'User not found' });
    }

    if (![100, 200, 500].includes(bet) || !['7up', '7down', '7'].includes(choice)) {
        return res.status(400).send({ message: 'Invalid bet or choice' });
    }

    const die1 = Math.floor(Math.random() * 6) + 1;
    const die2 = Math.floor(Math.random() * 6) + 1;
    const result = die1 + die2;

    let payout = 0;

    if ((choice === '7up' && result > 7) || (choice === '7down' && result < 7)) {
        payout = bet * 2;
    } else if (choice === '7' && result === 7) {
        payout = bet * 5;
    }

    userPoints += payout - bet;

    await User.findByIdAndUpdate(id, { Points: userPoints });

    console.log(die1,
        die2,
        result,
        userPoints,
        payout);


    res.send({
        die1,
        die2,
        result,
        userPoints,
        payout
    });
});

// Endpoint to get user points
app.get('/points', async (req, res) => {
    const { id } = req.body;
    const user = await User.findById(id);
    if (!user) {
        return res.status(400).send({ message: 'User not found' });
    }
    const userPoints = user.Points; F
    res.send({ userPoints });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
