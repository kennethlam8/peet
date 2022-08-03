import express, { Request, Response } from 'express'
import fetch from 'node-fetch'
import { client } from "./db";
import { hashPassword } from "./hash";
import { v4 as uuidv4 } from 'uuid';
import { form } from './server';




export let userRoutes = express.Router();

async function createNewUser(req: Request, res: Response) {
    form.parse(req, async (err, fields, files) => {



        console.log({ err, fields, files })


        if (err) {
            res.status(400).json({
                error: 'Invalid input'
            });
            return
        }
        console.log(req.body)

        let { username, password, email } = fields
        if (!username || !password || !email || !files || !files.image || !files.image['newFilename']) {
            res.status(400).json({
                error: 'Invalid input'
            });
            return
        }

        await client.query(
            /*SQL*/ `
            INSERT INTO USERS (username, email, password, image,created_at, updated_at) 
            values ($1,$2,$3, $4 ,current_timestamp, current_timestamp)
          `,
            [username, email, password, files.image['newFilename']]
        );

        res.json({
            message: `${username} is created !`
        });


    })

}

async function loginGoogle(req: Request, res: Response) {
    try {
        const accessToken = req.session?.["grant"].response.access_token;

        console.log("GOOGLE login accessToken:", accessToken);

        const fetchRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        const result = await fetchRes.json();
        console.log("Google result = ", result);
        let googlePicture = result.picture

        const users = (await client.query(/*SQL*/`SELECT * FROM users WHERE users.username = $1`, [result.email])).rows;


        let user = users[0];
        if (!user) {
            let randomString = uuidv4()
            let randomHashPassword = await hashPassword(randomString)



            user = (await client.query(/*SQL*/`
            INSERT INTO users (username, password,image,  created_at, updated_at) 
            values ($1, $2,$3, current_timestamp, current_timestamp)RETURNING *`,
                [result.email, randomHashPassword, googlePicture]
            )).rows[0]
        }
        if (req.session) {
            req.session["user"] = user;
        }
        res.redirect("/page1.html");
    } catch (error) {
        console.log("google login error : ", error);

        res.status(500).json({
            message: 'Google login fail'
        })
    }
};

async function login(req: Request, res: Response) {

    console.log(req.body)

    let { username, password } = req.body
    if (!username || !password) {
        res.status(400).json({
            error: 'Invalid input'
        });
        return
    }


    let dbUser = (await client.query(
            /*SQL*/ `
            select * from users where username = $1
          `,
        [username]
    )).rows[0]

    console.log(dbUser)

    if (dbUser.password == password) {

        req.session['user'] = dbUser
        res.json({
            message: "Login Success"
        })
    }
    else (
        res.status(400).json({
            message: "Wrong Password"
        })
    )

}


function getMe(req: Request, res: Response) {
    if (!req.session["user"]) {
        res.status(400).json({
            error: "Not yet login"
        })
        return
    }
    res.json({
        data: req.session["user"]
    })
}


async function userCurrentLocation(req: Request, res: Response) {
    let { lat, lng } = req.body
    console.log('request body userCurrentLocation :', { lat, lng })
    // await client.query(
    //     /*SQL*/ `
    //     INSERT INTO USERS (username, user_location, created_at, updated_at) 
    //     values ($1,$2, current_timestamp, current_timestamp)
    //   `,
    //     [req.session['user'].username, currentLatLng]
    // );
    await client.query(
        /*SQL*/ `
       update users set user_location = point($1, $2) where id = $3
      `,
        [lat, lng, req.session['user'].id]

    );
    res.json({
        message: `Location : ${{ lat, lng }} `
    });
}

async function nearbyLocation(req: Request, res: Response) {

    let result = (await client.query(
            /*SQL*/ `
            select * from users where user_location is not null
          `,
    )).rows

    console.log(result)
    res.json(result)
}

function logout(req: Request, res: Response) {
    let username = req.session["user"].username
    if (req.session) {
        req.session.destroy(() => {
        })
    }
    res.json({
        message: `${username} logout successfully`
    })
}

async function chatWithUserId(req: Request, res: Response) {
    try {
        let userId = req.session['user']?.id
        let memberId = req.query.userId
    
        if (!userId || !memberId){
            res.status(400).json({
                error: `Invalid input`
            })
            return
        }

        let found = (await client.query(`select * from chat_lists where host = $1 and member = $2 `,[userId , memberId])).rows[0]
    
        if (found){
            res.json({
                message: `host: ${userId} and member: ${memberId}already connected`
            })
            return
        }

        // Connection between host and member not found, create connection record
        await client.query(
            /*SQL*/ `
            INSERT INTO chat_lists (host, member, created_at, updated_at) 
            values ($1,$2 ,current_timestamp, current_timestamp)
          `,
            [userId , memberId]
        );
        res.json({
            message: `host: ${userId} and member: ${memberId} inserted`
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({
            message: 'System error'
        })
    }
   
}


userRoutes.post("/user", createNewUser);
userRoutes.get("/login/google", loginGoogle)
userRoutes.post("/login", login)
userRoutes.get("/me", getMe)
userRoutes.post("/userCurrentLocation", userCurrentLocation)
userRoutes.get("/nearbyLocation", nearbyLocation)
userRoutes.get("/chatWithUserId", chatWithUserId)

userRoutes.get('/logout', logout)
