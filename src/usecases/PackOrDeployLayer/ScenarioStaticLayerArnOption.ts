type Injection = {
  facade: IServerlessFacade
};

export async function UseCase(arn: string, { facade }: Injection): Promise<void> {
  const functions = facade.getFunctions();
  console.log({functions});

  // //
  // if (Object.keys(functions).length === 0) {
  //   // logs warn
  // }
}
