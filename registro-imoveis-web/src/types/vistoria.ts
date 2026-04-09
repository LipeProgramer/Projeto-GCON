export interface Foto {
  id: string;
  url: string;
  dataUrl?: string;
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
  nomeProjeto: string; // Fica lÃ¡ na toolbar
  processoSei: string;
  endereco: string;    // O campo "ImÃ³vel"
  secretaria: string;
  dataVistoria?: string;
  observacoes?: string;
  ambientes: Ambiente[];
}
