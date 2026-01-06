import { AuthorRequest, DeleteAuthorRequest } from './dto/index.js';
import {db} from "@/shared/config/database.js"
import {author} from "@/shared/infrastructure/database/schema.js"
import {eq} from "drizzle-orm"
import type { SelectAuthor, InsertAuthor } from "./author.model.js"
import type { IAuthorService } from './author.controller.js';

export default class AuthorService implements IAuthorService{

    getAuthor = async(authorRequest: AuthorRequest)
    : Promise<SelectAuthor | undefined> =>
    {
        const [result] = await db.select().from(author).where(eq(author.email, authorRequest.email)).limit(1)
        return result
    }


    createAuthor = async(newAuthor: InsertAuthor)
    :Promise<SelectAuthor> =>
    {
        const [createdAuthor] = await db.insert(author).values(newAuthor).returning()
        return createdAuthor
    }

    deleteAuthor = async(deleteAuthorRequest: DeleteAuthorRequest)
    :Promise<SelectAuthor | undefined> => 
    {
        const [deletedAuthor] = await db.delete(author).where(eq(author.id, deleteAuthorRequest.id)).returning()
        return deletedAuthor
    }
}