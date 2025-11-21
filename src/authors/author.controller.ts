import AuthorService from "./author.service.js"
export default class AuthorController{
    private authorService: AuthorService

    constructor(){
        this.authorService = new AuthorService()
    }

    async getAuthor(req: Request, res: Response): Promise<void>{
        
    }
}