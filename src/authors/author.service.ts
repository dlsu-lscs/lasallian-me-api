import {db} from "@/shared/config/database.js"
import {author} from "@/shared/infrastructure/database/schema.js"
import {eq} from "drizzle-orm"
import type { SelectAuthor, InsertAuthor } from "./author.model.js"
import type { IAuthorService } from './author.controller.js';
import { HttpError } from "@/shared/middleware/error.middleware.js";

export default class AuthorService implements IAuthorService{

    getAuthor = async(email: string)
    : Promise<SelectAuthor | undefined> =>
    {
        const [result] = await db.select().from(author).where(eq(author.email, email)).limit(1)
        return result
    }


    createAuthor = async(newAuthor: InsertAuthor)
    :Promise<SelectAuthor> =>
    {
        // Check if author with email already exists
        const existing = await this.getAuthor(newAuthor.email)
        if (existing) {
            throw new HttpError(409, "Author with this email already exists", "DUPLICATE_EMAIL")
        }

        const [createdAuthor] = await db.insert(author).values(newAuthor).returning()
        return createdAuthor
    }

    deleteAuthor = async(id: number)
    :Promise<SelectAuthor | undefined> => 
    {
        const [deletedAuthor] = await db.delete(author).where(eq(author.id, id)).returning()
        return deletedAuthor
    }
}