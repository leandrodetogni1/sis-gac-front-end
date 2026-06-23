export enum Category {
  ENSINO = "ENSINO",
  PESQUISA = "PESQUISA",
  EXTENSAO = "EXTENSAO",
}

export const CategoryLabels: Record<Category, string> = {
  [Category.ENSINO]: "Ensino",
  [Category.PESQUISA]: "Pesquisa",
  [Category.EXTENSAO]: "Extensão",
};
