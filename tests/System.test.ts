import {System} from '../src/core/System';

describe('System', () => {
  it('Calls system any command', () => {
    expect(System.exec('echo hello')).toContain('hello');
  });

  it('Calls exec with specified "cwd" path.', () => {
    expect(System.exec('pwd', '/tmp')).toContain('/private/tmp');
  });

  it('Exports environment to exec command', () => {
    process.env.MY_EXEC_TEST = "shows-this-text";
    expect(System.exec('echo $MY_EXEC_TEST')).toContain('shows-this-text');
  });
});
