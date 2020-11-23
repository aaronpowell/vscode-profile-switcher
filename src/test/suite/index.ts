import * as path from "path";
import * as Mocha from "mocha";
import * as glob from "glob";
import { createReport } from "../coverage";

export function run(): Promise<void> {
  const mocha = new Mocha({
    ui: "tdd",
    timeout: 7500,
    reporter: "mocha-multi-reporters",
    reporterOptions: {
      reporterEnabled: "spec, xunit",
      xunitReporterOptions: {
        output: path.join(__dirname, "..", "..", "test-results.xml"),
      },
    },
  });

  mocha.useColors(true);

  const testsRoot = path.resolve(__dirname, "..");

  return new Promise((c, e) => {
    glob("**/**.test.js", { cwd: testsRoot }, (err, files) => {
      if (err) {
        return e(err);
      }

      // Add files to the test suite
      files.forEach((f) => mocha.addFile(path.resolve(testsRoot, f)));

      try {
        // Run the mocha test
        mocha.run((failures) => {
          if (failures > 0) {
            e(new Error(`${failures} tests failed.`));
          } else {
            c(undefined);
          }
        });
      } catch (err) {
        e(err);
      }
    });
  }).then(() => {
    // Tests have finished executing, check if we should generate a coverage report
    if (process.env["GENERATE_COVERAGE"]) {
      createReport();
    }
  });
}
