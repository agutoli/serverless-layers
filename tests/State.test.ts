import {mocksInit} from './_utils';

import {State} from '../src/core/State';

describe('State', () => {
  let facade: any;
  let state: any;

  it('assert constructor calls', () => {
    expect(1).toEqual(1);
  });

  // describe('Unknown runtime', () => {
  //   // beforeEach(() => {
  //   //   facade = mocksInit.serverlessFacade({
  //   //     runtime: "foolang1.1"
  //   //   });
  //   //   state = new State(facade);
  //   // });

  //   it('assert constructor calls', () => {
  //     expect(1).toEqual(1);
  //   });
  // });
});
