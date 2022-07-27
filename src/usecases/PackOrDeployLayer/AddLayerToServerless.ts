type Injection = {
  facade: IServerlessFacade
};

export async function UseCase(arn: string, { facade }: Injection): Promise<void> {
  const functions = facade.getFunctions();
  for (const funcName in functions) {
    if (functions[funcName].layers) {
      const arns = new Set(functions[funcName].layers)
      functions[funcName].layers = Array.from(arns);
    } else {
      functions[funcName].layers = [arn];
    }
  }
}
