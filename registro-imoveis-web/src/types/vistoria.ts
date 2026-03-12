export interface Foto {
  id: string;
  url: string; // URL da imagem depois de salva no Firebase
  file?: File; // O arquivo físico antes do upload
  descricao?: string; // Caso seu pai queira colocar uma legenda na foto
}

export interface Vistoria {
  id?: string;
  titulo: string; // Ex: "Vistoria Terreno Zona 07"
  endereco: string;
  dataVistoria: Date;
  observacoes: string;
  fotos: Foto[];
}