import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

type ComId = { id: number };

type ListRepository<T extends ComId> = {
  list: () => Promise<T[]>;
  create: (item: Omit<T, "id">) => Promise<T>;
  update: (id: number, alteracoes: Partial<Omit<T, "id">>) => Promise<T[]>;
  remove: (id: number) => Promise<T[]>;
};

/**
 * Liga um repositório de lista a estado React, recarregando sempre que a
 * tela ganha foco (ex.: voltar de outra tela após cadastrar algo novo).
 */
export function createListHook<T extends ComId>(
  repository: ListRepository<T>,
) {
  return function useEntityList() {
    const [items, setItems] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);

    const refetch = useCallback(async () => {
      setLoading(true);

      try {
        setItems(await repository.list());
      } finally {
        setLoading(false);
      }
    }, []);

    useFocusEffect(
      useCallback(() => {
        refetch();
      }, [refetch]),
    );

    const create = useCallback(async (item: Omit<T, "id">) => {
      const novoItem = await repository.create(item);
      setItems((atual) => [...atual, novoItem]);
      return novoItem;
    }, []);

    const update = useCallback(
      async (id: number, alteracoes: Partial<Omit<T, "id">>) => {
        const listaAtualizada = await repository.update(id, alteracoes);
        setItems(listaAtualizada);
        return listaAtualizada;
      },
      [],
    );

    const remove = useCallback(async (id: number) => {
      const listaAtualizada = await repository.remove(id);
      setItems(listaAtualizada);
      return listaAtualizada;
    }, []);

    return { items, loading, refetch, create, update, remove };
  };
}
