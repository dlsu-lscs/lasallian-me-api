import AuthorController from "@/authors/author.controller.js"
import {Router} from "express"
import AuthorService from "@/authors/author.service.js"

const router = Router()
const authorService = new AuthorService()
const authorController = new AuthorController(authorService)

router.get("/:email", authorController.getAuthor)
router.delete("/:id", authorController.deleteAuthor)
router.post("/", authorController.postAuthor)

export default router