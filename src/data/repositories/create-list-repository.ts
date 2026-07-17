import AsyncStorage from "@react-native-async-storage/async-storage";

type ComId = { id: number };

/**
 * Repositório genérico para entidades salvas como uma lista JSON única no
 * AsyncStorage. Concentra o acesso a essa chave para permitir trocar a
 * implementação (ex.: por chamadas HTTP a uma API) sem alterar as telas.
 */
export function createListRepository<T extends ComId>(chave: string) {
  async function list(): Promise<T[]> {
    const salvos = await AsyncStorage.getItem(chave);
    return salvos ? (JSON.parse(salvos) as T[]) : [];
  }

  async function save(lista: T[]): Promise<void> {
    await AsyncStorage.setItem(chave, JSON.stringify(lista));
  }

  async function create(
    item: Omit<T, "id">,
    gerarId: () => number = Date.now,
  ): Promise<T> {
    const lista = await list();
    const novoItem = { ...item, id: gerarId() } as T;
    await save([...lista, novoItem]);
    return novoItem;
  }

  async function update(
    id: number,
    alteracoes: Partial<Omit<T, "id">>,
  ): Promise<T[]> {
    const lista = await list();
    const listaAtualizada = lista.map((item) =>
      item.id === id ? { ...item, ...alteracoes } : item,
    );
    await save(listaAtualizada);
    return listaAtualizada;
  }

  async function remove(id: number): Promise<T[]> {
    const lista = await list();
    const listaAtualizada = lista.filter((item) => item.id !== id);
    await save(listaAtualizada);
    return listaAtualizada;
  }

  return { list, save, create, update, remove };
}
