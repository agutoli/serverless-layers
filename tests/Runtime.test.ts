import Err from '../src/core/errors';
import {mocksInit} from './_utils';

import {RuntimeResolver} from '../src/core/Runtime';
import {RubyRuntimeAdapter} from '../src/runtimes/RubyAdapter';
import {NodeJsRuntimeAdapter} from '../src/runtimes/NodeJsAdapter';
import {PythonRuntimeAdapter} from '../src/runtimes/PythonAdapter';

describe('Runtime', () => {
  let facade: any;
  let resolver: any;

  describe('Unknown runtime', () => {
    beforeEach(() => {
      facade = mocksInit.serverlessFacade({
        runtime: "foolang1.1"
      });
      resolver = new RuntimeResolver(facade);
    });

    it('throws invalid runtime error', () => {
      expect(() => resolver.resolve()).toThrow(Err.InvalidRuntime);
      expect(() => resolver.resolve()).toThrow('Unknown provider.runtime "foolang1.1".');
    });
  });

  describe('NodeJS runtime', () => {
    beforeEach(() => {
      facade = mocksInit.serverlessFacade({
        runtime: "nodejs14.x"
      });
      resolver = new RuntimeResolver(facade);
      resolver.registerAdapter(new NodeJsRuntimeAdapter);
    });

    it('assert constructor calls', () => {
      expect(resolver.resolve()).toBeInstanceOf(NodeJsRuntimeAdapter);
    });
  });

  describe('Python runtime', () => {
    beforeEach(() => {
      facade = mocksInit.serverlessFacade({
        runtime: "python3.8"
      });
      resolver = new RuntimeResolver(facade);
      resolver.registerAdapter(new PythonRuntimeAdapter);
    });

    it('assert constructor calls', () => {
      expect(resolver.resolve()).toBeInstanceOf(PythonRuntimeAdapter);
    });
  });

  describe('Ruby runtime', () => {
    beforeEach(() => {
      facade = mocksInit.serverlessFacade({
        runtime: "ruby2.7"
      });
      resolver = new RuntimeResolver(facade);
      resolver.registerAdapter(new RubyRuntimeAdapter);
    });

    it('assert constructor calls', () => {
      expect(resolver.resolve()).toBeInstanceOf(RubyRuntimeAdapter);
    });
  });

  describe('Runtime duplicated/conflicts', () => {
    beforeEach(() => {
      facade = mocksInit.serverlessFacade({
        runtime: "ruby2.7"
      });
    });

    it('throws an error when duplicated runtime ids', () => {
      resolver = new RuntimeResolver(facade);
      const test = () => {
        resolver.registerAdapter(new PythonRuntimeAdapter);
        resolver.registerAdapter(new RubyRuntimeAdapter);
        resolver.registerAdapter(new RubyRuntimeAdapter);
      };
      // expect(test).toThrow(Err.RuntimeAdapterConflict);
      expect(test).toThrow('The runtime ID "ruby" is duplicated. It must be unique!');
    });
  });

  describe('Runtime missing', () => {
    beforeEach(() => {
      facade = mocksInit.serverlessFacade({});
    });

    it('throws an error when not specified runtime', () => {
      resolver = new RuntimeResolver(facade);
      const test = () => {
        resolver.registerAdapter(new RubyRuntimeAdapter);
      };
      expect(test).toThrow('The "provider.runtime" option is required!');
    });
  });
});
