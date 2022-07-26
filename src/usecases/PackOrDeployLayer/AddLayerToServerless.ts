type Injection = {
  facade: IServerlessFacade
};

export async function UseCase(arn: string, DI: Injection): Promise<void> {
  DI.facade.attachLayerByArn(arn); // void
}
