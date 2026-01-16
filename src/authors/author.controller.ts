import { AuthorRequestSchema, CreateAuthorRequestSchema, DeleteAuthorRequestSchema } from "./dto/index.js";
import { logger } from "@/shared/utils/logger.js";
import { formatZodErrors } from "@/shared/utils/validation.js";
import { Response, Request } from "express";
import type { InsertAuthor, SelectAuthor } from "./author.model.js";
import { HttpError } from "@/shared/middleware/error.middleware.js";

export interface IAuthorService {
    getAuthor(email: string): Promise<SelectAuthor | undefined>;
    createAuthor(newAuthor: InsertAuthor): Promise<SelectAuthor>;
    deleteAuthor(id: number): Promise<SelectAuthor | undefined>;
}


export default class AuthorController{
    constructor(private authorService: IAuthorService) {}

    /**
     * Handles GET requests for author by email
     * @route GET /api/authors/:email
     * @param req - Express request object with path parameters
     * @param res - Express response object
     */
    getAuthor = async(req: Request, res: Response): Promise<void> => {
        const parsed = AuthorRequestSchema.safeParse(req.params)

        if (!parsed.success) {
            logger.warn("Invalid path parameters", { errors: parsed.error.issues })
            throw new HttpError(400, "Invalid path parameters", "VALIDATION_ERROR", formatZodErrors(parsed.error.issues))
        }

        logger.debug("Fetching author", { email: parsed.data.email })

        const author = await this.authorService.getAuthor(parsed.data.email)

        if (!author) {
            logger.info("Author not found", { email: parsed.data.email })
            throw new HttpError(404, "Author not found", "NOT_FOUND")
        }

        logger.info("Author retrieved successfully", { authorId: author.id, email: author.email })

        res.status(200).json(author)
    }

    /**
     * Handles creating authors
     * @route POST /api/authors
     * @param req - Express request object with body data
     * @param res - Express response object
     */
    postAuthor = async (req: Request, res: Response): Promise<void> => {
        const parsed = CreateAuthorRequestSchema.safeParse(req.body)

        if (!parsed.success) {
            logger.warn("Invalid request body", { errors: parsed.error.issues })
            throw new HttpError(400, "Invalid request body", "VALIDATION_ERROR", formatZodErrors(parsed.error.issues))
        }

        const authorData: InsertAuthor = parsed.data

        logger.info("Creating author", { email: authorData.email })

        const author = await this.authorService.createAuthor(authorData)

        logger.info("Author created successfully", { authorId: author.id, email: author.email })

        res.status(201).json(author)
    }

    /**
     * Handles deleting authors
     * @route DELETE /api/authors/:id
     * @param req - Express request object with path parameters
     * @param res - Express response object
     */
    deleteAuthor = async(req: Request, res: Response): Promise<void> => {
        const parsed = DeleteAuthorRequestSchema.safeParse(req.params)

        if (!parsed.success) {
            logger.warn("Invalid path parameters", { errors: parsed.error.issues })
            throw new HttpError(400, "Invalid path parameters", "VALIDATION_ERROR", formatZodErrors(parsed.error.issues))
        }

        logger.info("Deleting author", { id: parsed.data.id })

        const author = await this.authorService.deleteAuthor(parsed.data.id)

        if (!author) {
            logger.info("Author not found", { id: parsed.data.id })
            throw new HttpError(404, "Author not found", "NOT_FOUND")
        }

        logger.info("Author deleted successfully", { authorId: author.id })

        res.status(204).send()
    }
}