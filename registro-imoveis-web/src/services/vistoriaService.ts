import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../config/firebase";
import type { Vistoria } from "../types/vistoria";

export async function salvarVistoriaNoFirebase(
  vistoriaData: Partial<Vistoria>,
) {
  try {
    const ambientesComFotos = [] as Array<{
      id: string;
      nome: string;
      fotos: Array<{ id: string; url: string; descricao?: string }>;
    }>;

    for (const ambiente of vistoriaData.ambientes ?? []) {
      const fotosProcessadas = [] as Array<{ id: string; url: string; descricao?: string }>;

      for (const foto of ambiente.fotos) {
        try {
          if (foto.dataUrl) {
            // Converter dataUrl para Blob
            const response = await fetch(foto.dataUrl);
            const blob = await response.blob();
            
            const caminhoStorage = `vistorias/${Date.now()}_${foto.id}.jpg`;
            const referenciaStorage = ref(storage, caminhoStorage);
            await uploadBytes(referenciaStorage, blob);
            const urlPublica = await getDownloadURL(referenciaStorage);

            fotosProcessadas.push({
              id: foto.id,
              url: urlPublica,
              descricao: foto.descricao || "",
            });
          } else if (foto.url) {
            // Se já tem URL, usar direto
            fotosProcessadas.push({
              id: foto.id,
              url: foto.url,
              descricao: foto.descricao || "",
            });
          }
        } catch (erroFoto) {
          console.error(`Erro ao processar foto ${foto.id}:`, erroFoto);
          throw new Error(`Falha ao fazer upload da foto: ${foto.id}`);
        }
      }

      ambientesComFotos.push({
        id: ambiente.id,
        nome: ambiente.nome,
        fotos: fotosProcessadas,
      });
    }

    const dadosParaGravar = {
      nomeProjeto: vistoriaData.nomeProjeto,
      processoSei: vistoriaData.processoSei,
      endereco: vistoriaData.endereco,
      secretaria: vistoriaData.secretaria,
      dataVistoria: vistoriaData.dataVistoria || null,
      observacoes: vistoriaData.observacoes || "",
      ambientes: ambientesComFotos,
      dataCriacao: new Date(),
    };

    const documentoRef = await addDoc(
      collection(db, "vistorias"),
      dadosParaGravar,
    );
    return documentoRef.id;
  } catch (erro) {
    console.error("Erro ao guardar no Firebase: ", erro);
    throw erro;
  }
}
