import { AuthorRequestSchema, CreateAuthorRequestSchema, AuthorResponseSchema, DeleteAuthorRequestSchema, AuthorRequest, DeleteAuthorRequest } from "./dto/index.js";
import { logger } from "@/shared/utils/logger.js";
import { Response, Request } from "express";
import type { InsertAuthor, SelectAuthor } from "./author.model.js";
import { HttpError } from "@/shared/middleware/error.middleware.js";

export interface IAuthorService {
    getAuthor(authorRequest: AuthorRequest): Promise<SelectAuthor | undefined>;
    createAuthor(newAuthor: InsertAuthor): Promise<SelectAuthor>;
    deleteAuthor(deleteAuthorRequest: DeleteAuthorRequest): Promise<SelectAuthor | undefined>;
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
            throw new HttpError(400, "Invalid path parameters", "VALIDATION_ERROR",
                parsed.error.issues.map(err => ({
                    field: err.path.join("."),
                    message: err.message
                }))
            )
        }

        logger.debug("Fetching author", { email: parsed.data.email })

        const authorRequest: AuthorRequest = parsed.data

        const author = await this.authorService.getAuthor(authorRequest)

        if (!author) {
            logger.info("Author not found", { email: parsed.data.email })
            throw new HttpError(404, "Author not found", "NOT_FOUND")
        }

        const responseValidation = AuthorResponseSchema.safeParse(author)
        if (!responseValidation.success) {
            logger.error("Invalid author response data", { errors: responseValidation.error.issues })
            throw new HttpError(500, "Internal server error", "INTERNAL_ERROR")
        }

        logger.info("Author retrieved successfully", { authorId: author.id, email: author.email })

        res.status(200).json(responseValidation.data)
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
            throw new HttpError(400, "Invalid request body", "VALIDATION_ERROR",
                parsed.error.issues.map(err => ({
                    field: err.path.join("."),
                    message: err.message
                }))
            )
        }

        const authorData: InsertAuthor = parsed.data

        logger.info("Creating author", { email: authorData.email })

        const author = await this.authorService.createAuthor(authorData)

        const responseValidation = AuthorResponseSchema.safeParse(author)
        if (!responseValidation.success) {
            logger.error("Invalid author response data", { errors: responseValidation.error.issues })
            throw new HttpError(500, "Internal server error", "INTERNAL_ERROR")
        }

        logger.info("Author created successfully", { authorId: author.id, email: author.email })

        res.status(201).json(responseValidation.data)
    }
    /**
     * Handles deleting authors
     * @route DELETE /api/authors/:id
    * @param req - Express request object with path parameters
     * @param res - Express response object
     */

    deleteAuthor = async(req: Request, res: Response): Promise<void> =>
    {
        const parsed = DeleteAuthorRequestSchema.safeParse(req.params)

        if(!parsed.success){
            logger.warn("Invalid path parameters", {error: parsed.error.issues})
            throw new HttpError(400, "Invalid path parameters", "VALIDATION_ERROR", 
                parsed.error.issues.map(err => ({
                    field: err.path.join("."),
                    message: err.message
                }))
            )
        }

        logger.info("Deleting author", { id: parsed.data.id })

        const authorRequest: DeleteAuthorRequest = parsed.data

        const author = await this.authorService.deleteAuthor(authorRequest)

        if (!author) {
            logger.info("Author not found", { id: parsed.data.id })
            throw new HttpError(404, "Author not found", "NOT_FOUND")
        }

        const responseValidation = AuthorResponseSchema.safeParse(author)

        if(!responseValidation.success){
            logger.error("Invalid author response data", {errors: responseValidation.error.issues})
            throw new HttpError(500, "Invalid author response data", "INTERNAL_ERROR")
        }   

        logger.info("Author deleted successfully", author)

        res.status(200).json(responseValidation.data)
    }
}