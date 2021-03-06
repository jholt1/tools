/*
 * Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt The complete set of authors may be found
 * at http://polymer.github.io/AUTHORS.txt The complete set of contributors may
 * be found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by
 * Google as part of the polymer project is also subject to an additional IP
 * rights grant found at http://polymer.github.io/PATENTS.txt
 */

import {assert} from 'chai';
import * as sinon from 'sinon';
import * as helpers from 'yeoman-test';
import {createGithubGenerator} from '../../../init/github';

import yeoGen = require('yeoman-generator');

/**
 * This small helper function wraps createGithubGenerator() so that we may add a
 * callback to access the github generator before it is run by Yeoman. Yeoman
 * doesn't give us this option otherwise (it takes a generator constructor and
 * creates the generator itself, internally).
 */
function createTestGenerator(
    generatorOptions: {owner: string, repo: string, semverRange?: string},
    generatorWillRun: (generator: yeoGen) => void) {
  return function TestGenerator(args: string[]|string, options: {} = {}) {
    const GithubGenerator = createGithubGenerator(generatorOptions);
    const githubGenerator = new GithubGenerator(args, options);
    generatorWillRun(githubGenerator);
    return githubGenerator;
  };
}

suite('init/github', () => {

  suite('createGithubGenerator()', () => {

    const semverMatchingRelease = {
      tarball_url: 'MATCHING_RELEASE_TARBALL_URL',
      tag_name: 'MATCHING_RELEASE_TAG_NAME',
    };

    let testName = 'returns a generator that untars the ' +
        'latest release when no semver range is given';
    test(testName, (done) => {
      let getSemverReleaseStub: sinon.SinonStub;
      let extractReleaseTarballStub: sinon.SinonStub;

      const TestGenerator = createTestGenerator(
          {
            owner: 'Polymer',
            repo: 'shop',
          },
          function setupGeneratorStubs(generator) {
            getSemverReleaseStub =
                // tslint:disable-next-line: no-any
                sinon.stub((generator as any)._github, 'getSemverRelease')
                    .returns(Promise.resolve(semverMatchingRelease));
            extractReleaseTarballStub =
                // tslint:disable-next-line: no-any
                sinon.stub((generator as any)._github, 'extractReleaseTarball')
                    .returns(Promise.resolve());
          });

      // tslint:disable-next-line: no-any
      helpers.run(TestGenerator as any).on('end', () => {
        assert.isOk(getSemverReleaseStub.calledWith('*'));
        assert.isOk(extractReleaseTarballStub.calledWith(
            semverMatchingRelease.tarball_url));
        done();
      });
    });

    testName = 'returns a generator that untars the latest ' +
        'matching release when a semver range is given';
    test(testName, (done) => {
      const testSemverRange = '^v123.456.789';
      let getSemverReleaseStub: sinon.SinonStub;
      let extractReleaseTarballStub: sinon.SinonStub;

      const TestGenerator = createTestGenerator(
          {
            owner: 'Polymer',
            repo: 'shop',
            semverRange: testSemverRange,
          },
          function setupGeneratorStubs(generator) {
            getSemverReleaseStub =
                // tslint:disable-next-line: no-any
                sinon.stub((generator as any)._github, 'getSemverRelease')
                    .returns(Promise.resolve(semverMatchingRelease));
            extractReleaseTarballStub =
                // tslint:disable-next-line: no-any
                sinon.stub((generator as any)._github, 'extractReleaseTarball')
                    .returns(Promise.resolve());
          });

      // tslint:disable-next-line: no-any
      helpers.run(TestGenerator as any).on('end', () => {
        assert.isOk(getSemverReleaseStub.calledWith(testSemverRange));
        assert.isOk(extractReleaseTarballStub.calledWith(
            semverMatchingRelease.tarball_url));
        done();
      });
    });

  });

});
