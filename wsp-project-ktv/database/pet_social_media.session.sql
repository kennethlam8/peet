
-- remind only do NOT copy without brain !
ALTER TABLE users ADD COLUMN user_location point;



CREATE TABLE users (
    id SERIAL primary key,
    username VARCHAR(255) not null,
    email VARCHAR(255),
    password VARCHAR(255) not null,
    image text,
    status VARCHAR(255),
    user_location point, 
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);



CREATE TABLE user_message (
    id SERIAL primary key,
    messageFrom INTEGER not null,
    messageTo INTEGER null,
    content text not null,
    created_at TIMESTAMP default NOW(),
    updated_at TIMESTAMP default NOW(),
    FOREIGN KEY (messageFrom) REFERENCES users(id),
    FOREIGN KEY (messageTo) REFERENCES users(id)
);


CREATE TABLE chat_lists (
    id SERIAL primary key,
    host INTEGER not null,
    member INTEGER not null,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (host) REFERENCES users(id),
    FOREIGN KEY (member) REFERENCES users(id)
);


