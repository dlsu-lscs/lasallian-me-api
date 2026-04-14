import AuthorController from "@/authors/author.controller.js"
import {Router} from "express"
import AuthorService from "@/authors/author.service.js"
import { requireApiKey } from "@/shared/middleware/auth.middleware.js"

const router = Router()
const authorService = new AuthorService()
const authorController = new AuthorController(authorService)

router.get("/:email",  authorController.getAuthor)
router.delete("/:id", requireApiKey, authorController.deleteAuthor)
router.post("/", requireApiKey, authorController.postAuthor)

export default router