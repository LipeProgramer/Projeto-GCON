export interface Foto {
  id: string;
  url: string;
  file?: File;
  descricao?: string;
}

export interface Ambiente {
  id: string;
  nome: string;
  fotos: Foto[];
}

export interface Vistoria {
  id?: string;
  nomeProjeto: string; // Fica lá na toolbar
  processoSei: string;
  endereco: string;    // O campo "Imóvel"
  secretaria: string;
  ambientes: Ambiente[];
}