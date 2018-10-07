What is this
============

Mocha Test Data Loader is a helper function to generate test cases
providing different data sets to the generic testing function.

## Installation

    yarn add --dev @zaufi/mocha-test-data-loader

or

    npm install --save-dev @zaufi/mocha-test-data-loader


## Usage

Imagine you are testing the `transformInput` function which gets some input and produce an output.
The simplest test plan is to feed it with various data and check the output against expected
values. Everything is fine when the input data is trivial... you can just copy-n-pasted the testing
expressions `expect(transformInput('blah')).to.be.blah(...)`. But even this simplest way is getting
boring very soon if you have some non-trivial data...

The idea is to put input data into an array of literal objects and generate test cases using a user
provided function. Sometimes input data could be quite complex objects. This makes tests written
in this way consists of too many lines of object properties. There is a way to move this data to
separate files and make the tests array much shorter.

The module exports the only function `makeTestCase(collection, userTestFn)`.
Every item of the given collection **must have** the `name` property with a short description
of the test case. The other ~keys~ properties are optional, however:

- properties which names end with `_file` will be used to load JSON data from
  and merge it with the object instance get passed to the user provided function.
  It's quite possible to have multiple properties referencing different files --
  all loaded data is going to be merged into a single object and later passed to
  the user-provided function;
- properties which names end with `_from` will be used to load JSON data from
  `<directory-of-the-test-file>/data/<name-of-the-test-file>.d/<value>.json`, where
  the `value` placeholder is a string value of the property. It is also possible
  to have multiple keys. All of them are going to be loaded in order of declaration,
  so in case of property names clash the latest value will win.

Example:

    describe('demo test cases', () =>
    {
        const tests = [
            {
                // The simplest one: all data specified right here
                name: 'case one'
              , input: 'this is just an ordinal string'
              , expected: 'this is the expected result (also string)'
            }
          , {
                // Explicit file: data get loaded from the `test_data_file`
                name: 'case two'
              , test_data_file: path.join(__dir, 'case-two.json')
            }
          , {
                // Indirect: data get loaded from `{__dirname}/data/this_test.js.d/case-three.json`
                name: 'case three'
              , test_data_from: 'case-three'
            }
          , {
                // Note, the test case name also could be a part of the data file, so
                // the only property you need is to specify what the file to load data from.
                test_data_from: 'case-four'
            }
        ];

        makeTestCase(tests, data =>
        {
            // Just make sure the current literal object has all expected properties
            expect(data).to.contain.all.keys(['name', 'input', 'expected']);

            // Do some trivial (or not) check
            expect(transformInput(data.input)).to.be.equal(data.expected);

        });

    }

The JSON files mentioned in example supposed to have properties `input` and `expected`.
Also, as noticed in the very last test case, `case-four.json` should have the `name` property.
