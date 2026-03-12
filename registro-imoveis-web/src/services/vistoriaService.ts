import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../config/firebase";
import type { Vistoria } from "../types/vistoria";

export async function salvarVistoriaNoFirebase(
  vistoriaData: Partial<Vistoria>,
) {
  try {
    const fotosFinais: { id: string; url: string; descricao?: string }[] = [];

    // 1. Fazer o upload de cada foto para o Storage
    if (vistoriaData.fotos && vistoriaData.fotos.length > 0) {
      for (const foto of vistoriaData.fotos) {
        if (foto.file) {
          // Cria um caminho único para a imagem (ex: vistorias/16789..._foto1.jpg)
          const caminhoStorage = `vistorias/${Date.now()}_${foto.file.name}`;
          const referenciaStorage = ref(storage, caminhoStorage);

          // Envia o ficheiro
          await uploadBytes(referenciaStorage, foto.file);

          // Pede ao Firebase o link público da imagem que acabou de subir
          const urlPublica = await getDownloadURL(referenciaStorage);

          fotosFinais.push({
            id: foto.id,
            url: urlPublica,
            descricao: foto.descricao || "",
          });
        }
      }
    }

    // 2. Preparar os dados para gravar no banco (sem os ficheiros pesados)
    const dadosParaGravar = {
      titulo: vistoriaData.titulo,
      endereco: vistoriaData.endereco,
      dataVistoria: vistoriaData.dataVistoria,
      observacoes: vistoriaData.observacoes,
      fotos: fotosFinais,
      dataCriacao: new Date(),
    };

    // 3. Gravar na coleção "vistorias" do banco de dados
    const documentoRef = await addDoc(
      collection(db, "vistorias"),
      dadosParaGravar,
    );
    return documentoRef.id;
  } catch (erro) {
    console.error("Erro ao guardar no Firebase: ", erro);
    throw erro; // Lança o erro para podermos mostrar um aviso no ecrã depois
  }
}
