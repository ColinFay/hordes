const expect = require("chai").expect;
const { library, mlibrary } = require("../src/library.js")

describe("lib", function() {
    it("library works", async function() {
        const base = await library("base")
        const twelve = await base.cat("12")
        expect(parseInt(12)).to.equal(12)
    });

    it("mlibrary works", async function() {
        const mstats = await mlibrary("stats")
        const twelvea = await mstats.lm("Sepal.Length ~ Sepal.Width, data = iris")
        const twelveb = await mstats.lm("Sepal.Length ~ Sepal.Width, data = iris")
        expect(twelvea).to.equal(twelveb)
    });

    it("library works when passed no params", async function() {
        const base = await library("base")
        const any = await base.any()
        expect(any.toString()).to.equal("[1] FALSE\n")
    });

    it("mlibrary works when passed no params", async function() {
        const mbase = await mlibrary("base")
        const any = await mbase.any()
        expect(any.toString()).to.equal("[1] FALSE\n")
    });
});