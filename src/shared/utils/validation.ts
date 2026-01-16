import type { ZodIssue } from "zod"

export const formatZodErrors = (issues: ZodIssue[]) =>
    issues.map(err => ({
        field: err.path.join("."),
        message: err.message
    }))
