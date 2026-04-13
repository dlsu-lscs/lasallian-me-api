import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import FavoritesService from "../favorites.service.js";
import { PgliteDatabase } from "drizzle-orm/pglite";
import { PGlite } from "@electric-sql/pglite";
import { createTestDatabase } from "@/shared/config/test-database.js";
import { application } from "@/applications/application.model.js";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { userFavorites } from "../favorites.model.js";
import { user } from "@/users/user.model.js";
import { author } from "@/authors/author.model.js";

describe("FavoritesService", () => {
    let service: FavoritesService;
    let db: PgliteDatabase;
    let client: PGlite;
    let testAuthorId: number;
    let firstApplicationId: number;
    let secondApplicationId: number;

    const firstUserId = "test-user-1";
    const secondUserId = "test-user-2";

    beforeAll(async () => {
        const testDb = await createTestDatabase();
        db = testDb.db as unknown as PgliteDatabase;
        client = testDb.client;

        service = new FavoritesService(db as NodePgDatabase);

        const [createdAuthor] = await db.insert(author).values({
            name: "Test Author",
            email: "test@example.com"
        }).returning();

        testAuthorId = createdAuthor.id;

        const [firstApplication] = await db.insert(application).values({
            title: "Test App 1",
            slug: "test-app-1",
            authorId: testAuthorId
        }).returning();

        firstApplicationId = firstApplication.id;

        const [secondApplication] = await db.insert(application).values({
            title: "Test App 2",
            slug: "test-app-2",
            authorId: testAuthorId
        }).returning();

        secondApplicationId = secondApplication.id;

        await db.insert(user).values([
            {
                id: firstUserId,
                name: "Test User One",
                email: "test-user-one@gmail.com"
            },
            {
                id: secondUserId,
                name: "Test User Two",
                email: "test-user-two@gmail.com"
            }
        ]);
    });

    afterEach(async () => {
        await db.delete(userFavorites);
    });

    afterAll(async () => {
        await client.close();
    });

    describe("createFavorite", () => {
        it("should create a favorite", async () => {
            await service.createFavorite({
                userId: firstUserId,
                applicationId: firstApplicationId
            });

            const favorites = await service.getUserFavorites(firstUserId);
            expect(favorites).toEqual([firstApplicationId]);
        });

        it("should throw 409 when favorite already exists", async () => {
            await service.createFavorite({
                userId: firstUserId,
                applicationId: firstApplicationId
            });

            await expect(service.createFavorite({
                userId: firstUserId,
                applicationId: firstApplicationId
            })).rejects.toMatchObject({
                statusCode: 409,
                code: "DUPLICATE_FAVORITE"
            });
        });
    });

    describe("getUserFavorites", () => {
        it("should return empty array if no favorites", async () => {
            const favorites = await service.getUserFavorites(firstUserId);
            expect(favorites).toEqual([]);
        });

        it("should return all application ids the user favorited", async () => {
            await service.createFavorite({
                userId: firstUserId,
                applicationId: firstApplicationId
            });
            await service.createFavorite({
                userId: firstUserId,
                applicationId: secondApplicationId
            });

            const favorites = await service.getUserFavorites(firstUserId);

            expect(favorites).toHaveLength(2);
            expect(favorites).toEqual(expect.arrayContaining([
                firstApplicationId,
                secondApplicationId
            ]));
        });
    });

    describe("getApplicationFavorites", () => {
        it("should return all users who favorited an application", async () => {
            await service.createFavorite({
                userId: firstUserId,
                applicationId: firstApplicationId
            });
            await service.createFavorite({
                userId: secondUserId,
                applicationId: firstApplicationId
            });

            const favorites = await service.getApplicationFavorites(firstApplicationId);

            expect(favorites).toHaveLength(2);
            expect(favorites).toEqual(expect.arrayContaining([
                firstUserId,
                secondUserId
            ]));
        });
    });

    describe("deleteFavorite", () => {
        it("should delete a favorite", async () => {
            await service.createFavorite({
                userId: firstUserId,
                applicationId: firstApplicationId
            });

            const deletedFavorite = await service.deleteFavorite(firstUserId, firstApplicationId);

            expect(deletedFavorite).toEqual({
                userId: firstUserId,
                applicationId: firstApplicationId
            });

            const favorites = await service.getUserFavorites(firstUserId);
            expect(favorites).toEqual([]);
        });

        it("should throw 404 when deleting a non-existing favorite", async () => {
            await expect(service.deleteFavorite(firstUserId, firstApplicationId)).rejects.toMatchObject({
                statusCode: 404,
                code: "NOT_FOUND"
            });
        });
    });
});
