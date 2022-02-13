const users=[]

const addUser=({id, username, room})=>{
    username=username.trim().toLowerCase()
    room=room.trim().toLowerCase()

    if(!username){
        return {
            error: 'Username is required'
        }
    } else if(!room){
        return{
            error: 'Room is required'
        }
    }

    const existingUser=users.find(user=>{
        return user.room===room && user.username===username
    })

    if(existingUser){
        return {
            error: 'User with this Username already exists!'
        }
    }
    const user={id, username, room}
    users.push(user)
    return user
}

const removeUser=id=>{
    const index=users.findIndex(user=>user.id===id)

    if(index>-1){
        return users.splice(index, 1)[0]
    }
    return {
        error: 'no user with this Id was found!'
    }

}


const getUser=id=>users.find(user=>user.id===id)

const getUsersInRoom=room=>users.filter(user=>user.room===room)

const user_func={
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}
export default user_func