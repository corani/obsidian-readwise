import "mocha";
import { assert } from "chai";
import { FileDoc } from '../src/fileDoc';
import { HeaderTemplateRenderer, HighlightTemplateRenderer } from "../src/template";
import { fileSystemHandler, resolvePathToData } from "./helpers";

describe("File Doc", () => {
    const handler = fileSystemHandler();

    context("sanitizeName", () => {
        var fileDoc: FileDoc;

        beforeEach(async () => {
            fileDoc = new FileDoc({
                id: 1,
                title: "Hello_Worl'd-",
                author: 'Rene Hernandez',
                num_highlights: 2,
                highlights: [],
                source_url: '',
                updated: "2021-03-18",
                highlights_url: '',
                category: 'article'
            },
                await HeaderTemplateRenderer.create(null, handler),
                await HighlightTemplateRenderer.create(null, handler),
                handler
            );
        });

        it("value is not modified", () => {
            assert.equal(fileDoc.sanitizeName(), "Hello_Worl'd-");
        });

        it("replaces :", () => {
            fileDoc.doc.title = "Hello: World";

            assert.equal(fileDoc.sanitizeName(), 'Hello- World')
        });

        it("replaces \\", () => {
            fileDoc.doc.title = "Hello 1\\ World";

            assert.equal(fileDoc.sanitizeName(), 'Hello 1- World')
        });

        it("replaces /", () => {
            fileDoc.doc.title = "Hello/World";

            assert.equal(fileDoc.sanitizeName(), 'Hello-World')
        });

        it("replaces |", () => {
            fileDoc.doc.title = "Hello|World";

            assert.equal(fileDoc.sanitizeName(), 'Hello-World')
        })

        it("replaces .", () => {
            fileDoc.doc.title = "Hello.World";

            assert.equal(fileDoc.sanitizeName(), 'Hello_World')
        })

        it("Removes query params, slashes and protocol from URL (http and https)", () => {
            fileDoc.doc.title = "https://example.com/2021-04-26/article-name-12?foo=bar&key=value";

            assert.equal(fileDoc.sanitizeName(), "example_com-2021-04-26-article-name-12");

            fileDoc.doc.title = "http://example.com/2021-04-26/article-name-13?foo=bar&key=value";

            assert.equal(fileDoc.sanitizeName(), "example_com-2021-04-26-article-name-13");
        });
    });

    context('filePath', () => {
        let fileDoc: FileDoc;

        beforeEach(async () => {
            fileDoc = new FileDoc({
                id: 1,
                title: "Hello World",
                author: 'Rene Hernandez',
                num_highlights: 2,
                highlights: [],
                source_url: '',
                updated: "2021-03-18",
                highlights_url: '',
                category: 'article'
            },
            await HeaderTemplateRenderer.create(null, handler),
            await HighlightTemplateRenderer.create(null, handler),
            handler
            );
        });

        it("generates the fileDoc path if unspecified", () => {
            assert.equal(fileDoc.preparePath(), "Hello World.md");
        });

        it("generates a specified fileDoc path", () => {
            assert.equal(fileDoc.preparePath('foo/bar'), "foo/bar/Hello World.md");
        });

        it("Handles trailing slash in a specified fileDoc path", () => {
            assert.equal(fileDoc.preparePath('foo/bar/'), "foo/bar/Hello World.md");
        });

    });

    context('createOrUpdate', () => {
        it('inserts at insert point', async () => {
            let fileDoc = new FileDoc({
                    id: 1,
                    title: "Insert Point",
                    author: 'Rene Hernandez',
                    num_highlights: 2,
                    highlights: [{
                        id: 10,
                        book_id: 5,
                        chapter: "chapter",
                        text: "Looks important. It's super <great>",
                        note: "It really looks important. Can't wait for it",
                        url: 'https://readwise.io',
                        location: 1,
                        updated: "2020-04-06T12:30:52.318552Z"
                    }],
                    source_url: '',
                    updated: "2021-03-18",
                    highlights_url: '',
                    category: 'article'
                },
                await HeaderTemplateRenderer.create(null, handler),
                await HighlightTemplateRenderer.create(null, handler),
                handler
            );
            let note = resolvePathToData('notes');
            
            await fileDoc.createOrUpdate(note);
            assert.equal(await handler.read(note+"/Insert Point.md"), `# Title

Some text

# Notes

Existing notes

Looks important. It's super <great> %% highlight_id: 10 %%
Note: It really looks important. Can't wait for it

%% highlight_insert_point %%

# Resources

Some links
`);
        });

        it('appends when no insert point', async () => {
            let fileDoc = new FileDoc({
                    id: 1,
                    title: "No Insert Point",
                    author: 'Rene Hernandez',
                    num_highlights: 2,
                    highlights: [{
                        id: 10,
                        book_id: 5,
                        chapter: "chapter",
                        text: "Looks important. It's super <great>",
                        note: "It really looks important. Can't wait for it",
                        url: 'https://readwise.io',
                        location: 1,
                        updated: "2020-04-06T12:30:52.318552Z"
                    }],
                    source_url: '',
                    updated: "2021-03-18",
                    highlights_url: '',
                    category: 'article'
                },
                await HeaderTemplateRenderer.create(null, handler),
                await HighlightTemplateRenderer.create(null, handler),
                handler
            );
            let note = resolvePathToData('notes');
            
            await fileDoc.createOrUpdate(note);
            assert.equal(await handler.read(note+"/No Insert Point.md"), `# Title

Some text

# Notes

Existing notes

# Resources

Some links


Looks important. It's super <great> %% highlight_id: 10 %%
Note: It really looks important. Can't wait for it

`);
        });
    });
});
