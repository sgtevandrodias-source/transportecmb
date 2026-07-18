import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

type ComId = { id: number };

type ListRepository<T extends ComId> = {
  list: () => Promise<T[]>;
  create: (item: Omit<T, "id">) => Promise<T>;
  update: (id: number, alteracoes: Partial<Omit<T, "id">>) => Promise<void>;
  remove: (id: number) => Promise<void>;
};

/**
 * Liga um repositório de lista a estado React, recarregando sempre que a
 * tela ganha foco (ex.: voltar de outra tela após cadastrar algo novo) ou
 * depois de qualquer mutação — os dados agora vivem num banco compartilhado
 * entre dispositivos, então a lista local nunca deve ser deduzida a partir
 * da própria mutação, só recarregada do servidor.
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

    const create = useCallback(
      async (item: Omit<T, "id">) => {
        const novoItem = await repository.create(item);
        await refetch();
        return novoItem;
      },
      [refetch],
    );

    const update = useCallback(
      async (id: number, alteracoes: Partial<Omit<T, "id">>) => {
        await repository.update(id, alteracoes);
        await refetch();
      },
      [refetch],
    );

    const remove = useCallback(
      async (id: number) => {
        await repository.remove(id);
        await refetch();
      },
      [refetch],
    );

    return { items, loading, refetch, create, update, remove };
  };
}
