import { Server } from 'socket.io';

const io = new Server(9000, {
    cors: {
        origin: 'http://localhost:3000',
    },
});

let users = [];

const addUser = (userData, socketId) => {
    // Check if a user with the same sub already exists
    const existingUser = users.find((user) => user.sub === userData.sub);

    if (!existingUser) {
        users.push({ ...userData, socketId });
    }
};

const removeUser = (socketId) => {
    users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
    return users.find((user) => user.sub === userId);
};

io.on('connection', (socket) => {
    console.log('user connected');

    // Connect
    socket.on('addUser', (userData) => {
        addUser(userData, socket.id);
        io.emit('getUsers', users);
    });

    // Send message
    socket.on('sendMessage', (data) => {
        const user = getUser(data.receiverId);

        if (user) {
            io.to(user.socketId).emit('getMessage', data);
        }
    });

    // Disconnect
    socket.on('disconnect', () => {
        console.log('user disconnected');
        removeUser(socket.id);
        io.emit('getUsers', users);
    });
});
