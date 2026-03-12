import { useState } from 'react';
import type { Vistoria, Foto } from '../types/vistoria';
import { salvarVistoriaNoFirebase } from '../services/vistoriaService'; // <-- IMPORTAÇÃO NOVA

export function NovaVistoria() {
  const [vistoria, setVistoria] = useState<Partial<Vistoria>>({
    titulo: '',
    endereco: '',
    observacoes: '',
    fotos: [],
  });
  
  // Novo estado para controlar se estamos a gravar os dados
  const [aGuardar, setAGuardar] = useState(false);

  const handleAdicionarFotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const arquivos = Array.from(e.target.files);
      const novasFotos: Foto[] = arquivos.map((arquivo) => ({
        id: crypto.randomUUID(),
        url: URL.createObjectURL(arquivo),
        file: arquivo,
      }));

      setVistoria(prev => ({
        ...prev,
        fotos: [...(prev.fotos || []), ...novasFotos]
      }));
    }
  };

  const handleRemoverFoto = (idParaRemover: string) => {
    setVistoria(prev => ({
      ...prev,
      fotos: prev.fotos?.filter(foto => foto.id !== idParaRemover)
    }));
  };

  // --- FUNÇÃO ATUALIZADA ---
  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!vistoria.titulo || !vistoria.endereco || !vistoria.dataVistoria) {
      alert("Por favor, preencha os campos obrigatórios.");
      return;
    }

    try {
      setAGuardar(true); // Muda o botão para "A guardar..."
      
      const idGerado = await salvarVistoriaNoFirebase(vistoria);
      
      alert(`Vistoria guardada com sucesso! ID: ${idGerado}`);
      
      // Limpa o formulário para a próxima vistoria
      setVistoria({ titulo: '', endereco: '', observacoes: '', fotos: [] });
      
    } catch (erro) {
      alert("Ocorreu um erro ao guardar. Verifique a consola.");
    } finally {
      setAGuardar(false); // Volta o botão ao normal
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h2>Novo Relatório de Vistoria</h2>
      
      <form onSubmit={handleGuardar} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ fontWeight: 'bold', marginBottom: '5px' }}>Título</label>
          <input 
            type="text" 
            value={vistoria.titulo}
            onChange={e => setVistoria({...vistoria, titulo: e.target.value})}
            style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
            required
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ fontWeight: 'bold', marginBottom: '5px' }}>Endereço do Imóvel</label>
          <input 
            type="text" 
            value={vistoria.endereco}
            onChange={e => setVistoria({...vistoria, endereco: e.target.value})}
            style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
            required
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ fontWeight: 'bold', marginBottom: '5px' }}>Data da Vistoria</label>
          <input 
            type="date" 
            value={vistoria.dataVistoria ? new Date(vistoria.dataVistoria).toISOString().split('T')[0] : ''}
            onChange={e => setVistoria({...vistoria, dataVistoria: new Date(e.target.value)})}
            style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
            required
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ fontWeight: 'bold', marginBottom: '5px' }}>Observações</label>
          <textarea 
            value={vistoria.observacoes}
            onChange={e => setVistoria({...vistoria, observacoes: e.target.value})}
            style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', minHeight: '100px' }}
          />
        </div>

        <div style={{ border: '2px dashed #ccc', padding: '20px', borderRadius: '5px', textAlign: 'center' }}>
          <label style={{ fontWeight: 'bold', cursor: 'pointer', display: 'block', marginBottom: '10px' }}>
            Clique aqui para adicionar fotos
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              onChange={handleAdicionarFotos}
              style={{ display: 'none' }} 
            />
          </label>
          
          {vistoria.fotos && vistoria.fotos.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '15px' }}>
              {vistoria.fotos.map((foto) => (
                <div key={foto.id} style={{ position: 'relative', width: '100px', height: '100px' }}>
                  <img 
                    src={foto.url} 
                    alt="Preview" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '5px' }} 
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoverFoto(foto.id)}
                    style={{
                      position: 'absolute', top: '5px', right: '5px', background: 'red', color: 'white', 
                      border: 'none', borderRadius: '50%', width: '25px', height: '25px', cursor: 'pointer'
                    }}
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button 
          type="submit" 
          disabled={aGuardar} // Desativa o botão se estiver a gravar
          style={{ 
            padding: '15px', 
            backgroundColor: aGuardar ? '#ccc' : '#0056b3', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px', 
            cursor: aGuardar ? 'not-allowed' : 'pointer', 
            fontWeight: 'bold', 
            fontSize: '16px'
          }}
        >
          {aGuardar ? 'A guardar vistoria e imagens...' : 'Guardar Dados'}
        </button>
      </form>
    </div>
  );
}