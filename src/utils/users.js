users = []

const addUser = ({ id, username, room }) => {

    // clean the data
    username = username.trim()
    room = room.trim()

    // Validate the data
    if(!username || !room)
        return {
            error: "Username and room are required !"
        }

    // Check for existing user
    const userExists = users.find((user) => {
        return user.username == username && user.room == room
    })

    // Validate username
    if(userExists)
        return {
            error: "Username already in use !"
        }   

    // Store user
    const user = { id, username, room }
    users.push(user)
    return { user }
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)

    if( index !== -1 ){
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    const user = users.find((user) => user.id == id )

    if(!user)
        return {
            error: "Users not found !"
        }

    return user 
}

const getUsersInRoom = (room) => {
    room = room.trim()
    return users.filter((user) => user.room === room)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}