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
        if (foto.file) {
          const caminhoStorage = `vistorias/${Date.now()}_${foto.file.name}`;
          const referenciaStorage = ref(storage, caminhoStorage);
          await uploadBytes(referenciaStorage, foto.file);
          const urlPublica = await getDownloadURL(referenciaStorage);

          fotosProcessadas.push({
            id: foto.id,
            url: urlPublica,
            descricao: foto.descricao || "",
          });
        } else {
          fotosProcessadas.push({
            id: foto.id,
            url: foto.url,
            descricao: foto.descricao || "",
          });
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
