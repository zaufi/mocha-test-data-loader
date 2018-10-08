'use strict';

// Foreign imports
var fs = require('fs');
var path = require('path');

const makeDataFilename = (test_filename, mod_name) =>
{
    return path.format({
        dir: path.join(
            path.join(path.dirname(test_filename), 'data')
          , path.basename(test_filename) + '.d'
          )
      , name: mod_name.replace(/_{2,}/g, '_')
      , ext: '.json'
      });
}

function* matched_keys(obj, re)
{
    for (var key in obj)
        if (re.test(key))
            yield key;
}

const enrichTestData = (data, base_data_path) =>
{
    let result = data;

    // Try produce data filenames from properties named `.*_from`
    for (let key of matched_keys(result, /.*_from$/))
    {
        const filename = makeDataFilename(base_data_path, result[key]);
        result[key.replace('_from', '_file')] = filename;
    }

    // Try load data from properties named `.*_file`
    for (let key of matched_keys(result, /.*_file$/))
    {
        result = {...result, ...JSON.parse(fs.readFileSync(result[key]))};
    }

    return result;
}

/**
 * Make a test case(s) using a collection of test data objects and
 * an unary function receiving every item of the collection possible
 * updated w/ data loaded from JSON file(s).
 *
 * The only mandatory property for the test item is the `name` --
 * a short test case description.
 *
 * \todo Check `.name` attribute before access it!
 */
const makeTestCase = (tests, fn, is_async=false) =>
{
    tests.forEach(test =>
    {
        if (is_async)
        {
            it(test.name, async function()
            {
                // Ok, call a given function passing collected test data
                await fn(enrichTestData(test, this.test.file));
            });
        }
        else
        {
            it(test.name, function()
            {
                // Ok, call a given function passing collected test data
                fn(enrichTestData(test, this.test.file));
            });
        }
    });
}

/**
 * Make a test suite.
 *
 * Same as `makeTestCase`, but use `describe()` instead of `it()` from `mocha`.
 */
const makeTestSuite = (tests, fn, is_async=false) =>
{
    tests.forEach(test =>
    {
        if (is_async)
        {
            describe(test.name, async function()
            {
                // Ok, call a given function passing collected test data
                await fn(enrichTestData(test, this.parent.file));
            });
        }
        else
        {
            describe(test.name, function()
            {
                // Ok, call a given function passing collected test data
                fn(enrichTestData(test, this.parent.file));
            });
        }
    });
}

module.exports = makeTestCase;
module.exports.makeTestSuite = makeTestSuite;
