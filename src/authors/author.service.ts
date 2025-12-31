import {db} from "@/shared/config/database.js"
import {author} from "@/shared/infrastructure/database/schema.js"
import {eq} from "drizzle-orm"
import type { SelectAuthor, InsertAuthor } from "./author.model.js"

export default class AuthorService{

    getAuthor = async(email: string)
    : Promise<SelectAuthor | undefined> =>
    {
        const [result] = await db.select().from(author).where(eq(author.email, email)).limit(1)
        return result
    }

    createAuthor = async(newAuthor: InsertAuthor)
    :Promise<SelectAuthor> =>
    {
        const [myAuthor] = await db.insert(author).values(newAuthor).returning()
        return myAuthor
    }

    deleteAuthor = async(authorId: number)
    :Promise<SelectAuthor> => 
    {
        const [myAuthor] = await db.delete(author).where(eq(author.id, authorId)).returning()
        return myAuthor
    }
}