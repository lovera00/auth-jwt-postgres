class User {
    id_users: number;
    username: string;
    password: string;
    status: boolean;
    create_at: Date;
    update_at: Date | null;

    constructor(id_users: number, username: string, password: string, status: boolean, create_at: Date, update_at: Date | null) {
        this.id_users = id_users;
        this.username = username;
        this.password = password;
        this.status = status;
        this.create_at = create_at;
        this.update_at = update_at;
    }
}
export default User;
