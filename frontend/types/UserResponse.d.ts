
type UserResponse = {
    user_id: string
    email: string
    name: string
    picture: string | null
    username: string | null
    created_at: string
    updated_at: string
}

export default UserResponse;