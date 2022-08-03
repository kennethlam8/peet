
import env from '../env'
import pg from "pg";

const client = new pg.Client({
    database: env.DB_NAME,
    user: env.DB_USERNAME,
    password: env.DB_PASSWORD,
});

let userInfos = [
    { username: 'Dickson', password: '123', image: 'dickson.jpeg' },
    { username: 'Kenneth', password: '123', image: 'kenneth.jpeg' },
    { username: 'Veronica', password: '123', image: 'veronica.jpeg' },
    { username: 'Tony', password: '123', image: 'tony.jpeg' },

]

let userMessages = [
    { messageFrom: 1, messageTo: 2, content: 'Hello Kenneth' },
    { messageFrom: 2, messageTo: 3, content: 'Yo Tony' },
    { messageFrom: 3, messageTo: 4, content: 'Greeting Veronica' },
    { messageFrom: 4, messageTo: 1, content: 'Hi Dickson' }
]

let chat_lists = [
   { host: 1, member: 2 },
   { host: 1, member: 3 },
   { host: 1, member: 4 },
]



async function main() {

    try {
        await client.connect()
        // client.query(/*SQL*/`
        // insert into users (username, password) values ($1,$2) 
        // `, ['dickson', 123])

        console.log('connection done')
        
        await client.query("truncate table chat_lists RESTART IDENTITY;");
        await client.query("truncate table user_message RESTART IDENTITY;");
        await client.query("truncate table users RESTART IDENTITY CASCADE;");

        for (let userInfo of userInfos) {
            await client.query(
                /*SQL*/`INSERT INTO users (username, password, image) values ($1, $2, $3)`,
                [userInfo.username, userInfo.password, userInfo.image]
            );
        }
        console.log('user done')

       
        for (let userMessage of userMessages) {
            await client.query(
                /*SQL*/`INSERT INTO user_message (messageFrom, messageTo, content) values ($1, $2, $3)`,
                [userMessage.messageFrom, userMessage.messageTo, userMessage.content]
            );
        }
        console.log('message done')


        for (let chat_list of chat_lists) {
            await client.query(
                /*SQL*/`INSERT INTO chat_lists (host, member,created_at,updated_at) values ($1, $2, NOW(), NOW())`,
                [chat_list.host, chat_list.member]
            );
        }
        console.log('chat_list done')

       


    } catch (error) {
        console.error("Error during init data :" + error)
    } finally {
        client.end();
    }

}


main()