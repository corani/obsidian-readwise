import "mocha";
import { assert } from "chai";
import { TitlesMapping } from "../src/titlesMapping";
import { fileSystemHandler } from "./helpers";

describe("TitlesMapping", () => {
    const handler = fileSystemHandler();

    context("load", () => {
        it('loads the titles data into object', async () => {
            const titlesMapping = new TitlesMapping('titles.json', handler);
            await titlesMapping.initialize();
            const mapping = await titlesMapping.load();

            assert.equal(mapping.get("The New Puritans: How the Religion of Social Justice Captured the Western World"), "The New Puritans");
        });
    });
});

