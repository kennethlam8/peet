import express, { Request, Response } from 'express'
import { print } from 'listening-on'
import path from 'path';
import expressSession from 'express-session'
import env from './env';
import { client, connectDB } from './db';
import { userRoutes } from './user'
import grant from 'grant';
import { format } from 'date-fns';
import http from 'http';
import { Server as SocketIO } from 'socket.io'
import formidable from 'formidable'
import fs from 'fs'


const app = express();
const server = new http.Server(app);
const io = new SocketIO(server);
const uploadDir = 'uploads'
fs.mkdirSync(uploadDir, { recursive: true })

export const form = formidable({
  uploadDir,
  keepExtensions: true,
  maxFiles: 1,
  maxFileSize: 200 * 1024 ** 2, // the default limit is 200KB
  filter: part => part.mimetype?.startsWith('image/') || false,
})


connectDB()
app.use(express.json())

const sessionMiddleware = expressSession({
    secret: env.SESSION_SECRET,
    resave:true,
    saveUninitialized:true,
    cookie:{secure:false}
});

app.use(sessionMiddleware);
declare module 'express-session' {
    interface SessionData {
        username?: string
    }
}

io.use((socket,next)=>{
    let req = socket.request as express.Request
    let res = req.res as express.Response
    sessionMiddleware(req, res, next as express.NextFunction)
});

const grantExpress = grant.express({
    "defaults": {
        "origin": "http://localhost:8080",
        "transport": "session",
        "state": true,
    },
    "google": {
        "key": env.GOOGLE_CLIENT_ID,
        "secret": env.GOOGLE_CLIENT_SECRET,
        "scope": ["profile", "email"],
        "callback": "/login/google"
    }
});


app.use(grantExpress as express.RequestHandler);
app.use(userRoutes);

app.get('/', async (req, res) => {

    res.sendFile(path.resolve(path.join('public', 'pages', 'page1.html')))
})


app.use(express.static('public'))
app.use('/assets/img/user', express.static('uploads'))
app.use(express.static('public/pages'))

app.get('/users', async (req, res) => {
    let result = await client.query('select * from users')
    res.json(result.rows)
})

app.get('/chat_lists', async (req, res) => {
    if (!req.session || !req.session['user']){
        res.status(400).json({
            error:'not yet login'
        })
        return
    }
    let userId = req.session['user']['id'] 
    console.log('userid =  ', userId)

    let userListResult = await client.query(`
    select 
    users.id,
    users.username,
    users.email,
    users.image 
    from chat_lists join users on chat_lists.member = users.id
    where chat_lists.host = $1`
        , [userId]
    )
    let userList = userListResult.rows


    console.table(userList)


    for (let userListItem of userList) {

        let lastContentResults = (await client.query(`
        select * from user_message
        where 
        (messageFrom = $1 and messageTo = $2) 
        or
        (messageFrom = $2 and messageTo = $1)
        ORDER BY created_at DESC LIMIT 1
        `, [userId, userListItem.id]
        )).rows


        if (!lastContentResults || lastContentResults.length === 0) {
            userListItem.lastContent = ''
            userListItem.time = ''
        } else {
            userListItem.lastContent = lastContentResults[0].content
            userListItem.time = format(lastContentResults[0].created_at, 'HH:mm') || ''
            userListItem.created_at = lastContentResults[0].created_at
        }
    }

    userList.sort((a, b) => {
        return b.created_at - a.created_at
    })
    console.table(userList)
    res.json(userList)
})

async function getUserMessage(req: Request, res: Response) {
    if (!req.session || !req.session['user']){
        res.status(400).json({
            error:'not yet login'
        })
        return
    }
    let userId = req.session['user']['id']  // user who loggined 
    console.log(req.params)
    let memberId = req.params.memberId

    let result =
        await client.query(`
    select * from user_message
    where (messageFrom = $1 and messageTo = $2) or
    (
    messageFrom = $2 and messageTo = $1
    )`, [userId, Number(memberId)]
        )

    let messages = result.rows


    for (let message of messages) {
        message.isSelf = message.messagefrom === userId ? true : false
        message.timeLabel = format(message.created_at, 'HH:mm')
    }

    let memberInfo = (await client.query(`select * from users where id = $1 `,[Number(memberId)])).rows[0]
    if (!memberInfo){
        res.status(400).json({
            error:"Invalid member id"
        })
        return
    }
    let returnObject = {
        messages,
        userInfo:memberInfo
    }
    

    res.json(returnObject)
}
app.get('/message/:memberId', getUserMessage)



async function creatNewMessage(req: Request, res: Response) {

    if (req.session && req.session['user']) {
        console.log("you are :", req.session['user'].userName);

    } else {
        console.log('NOt yet login');
        res.status(400).json({
            error: 'Invalid request, login first'
        })
        return

    }
    console.log(req.body)
    // let content = req.body.content
    // let toUserId = req.body.toUserId

    let { content, toUserId } = req.body

    console.log('content :', content);
    console.log('toUserId :', toUserId);

    await client.query(
    /*SQL*/`INSERT INTO user_message (messageFrom, messageTo, content) values ($1, $2, $3)`,
        [req.session['user'].id, toUserId, content]
    );


    let fromDbUser = (await client.query(`select * from users where id = $1` , [req.session['user'].id])).rows[0]

    res.json('ok')

    io.to(`room_${toUserId}`).emit('new-message',
    {
        content: content, 
        from : {
            id:fromDbUser.id,
            userName: fromDbUser.username,
            img:fromDbUser.image
        }
    })
}
app.post('/message', creatNewMessage)


app.get('/users/:id', async (req, res) => {
    let userId = req.params.id
    if(!userId){
        res.status(400).json({
            error:"Invalid input"
        })
        return
    }
    console.log({ userId })
    let result = await client.query(/*sql*/`select * from users where id =$1`, [Number(userId)])
    let dbUser = result.rows[0]
    if (!dbUser) {
        res.status(401).json({
            error: "No User found"
        })
        return
    }
    res.json({
        data: dbUser
    })
})






io.on('connection', function (socket) {
    console.log(`New user :${socket.id} is connected to server`);
    const req = socket.request as express.Request;
    let socketSessionUser = req.session['user'];

    if(socketSessionUser){
        let roomName = `room_${socketSessionUser.id}`
        socket.join(roomName)
        console.log(`${socketSessionUser.username} joined ${roomName}`)
    }
});

app.use((req, res) => {
    res.sendFile(path.resolve(path.join('public', 'pages/404.html')))
})

const PORT = 8080;
server.listen(PORT, () => {
    console.log(`Monitoring : http://localhost:${PORT}/`);

    print(PORT)
})