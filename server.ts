import app from "./src/app.js";
import { logger } from "@/shared/utils/logger.js";
const port = process.env.PORT || 8000;

app.listen(port, () => {
    logger.info(`Server is running on port ${port}`);
});