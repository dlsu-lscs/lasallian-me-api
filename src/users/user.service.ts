// User business logic
import { db } from "@/shared/config/database.js";
import { user } from "./user.model.js";
import { eq } from 'drizzle-orm';

export default class UserService {

    async getUserByEmail(email: string) {
        const myUser = await db.select().from(user).where(eq(user.email, email)).limit(1);
        return myUser[0];
    }
}