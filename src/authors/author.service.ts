import {db} from "@/shared/config/database.js"
import {author} from "@/shared/infrastructure/database/schema.js"
import {eq} from "drizzle-orm"

export type SelectAuthor = typeof author.$inferSelect
export type InsertAuthor = typeof author.$inferInsert

export default class AuthorService{

    async getAuthor(email: string)
    : Promise<SelectAuthor | undefined>
    {
        const [result] = await db.select().from(author).where(eq(author.email, email)).limit(1)
        return result
    }

    async createAuthor(newAuthor: InsertAuthor)
    :Promise<SelectAuthor>
    {
        const [myAuthor] = await db.insert(author).values(newAuthor).returning()
        return myAuthor
    }

    async deleteAuthor(authorId: number)
    :Promise<SelectAuthor>{
        const [myAuthor] = await db.delete(author).where(eq(author.id, authorId)).returning()
        return myAuthor
    }
}