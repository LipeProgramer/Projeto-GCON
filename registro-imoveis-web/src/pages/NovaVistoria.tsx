import { useState } from 'react';
import type { Vistoria, Foto } from '../types/vistoria';

export function NovaVistoria() {
  const [vistoria, setVistoria] = useState<Partial<Vistoria>>({
    titulo: '',
    endereco: '',
    observacoes: '',
    fotos: [], // Iniciamos a lista de fotos vazia
  });

  // Função para lidar com a seleção de imagens
  const handleAdicionarFotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const arquivos = Array.from(e.target.files);
      
      // Transformamos os arquivos selecionados no formato que definimos no nosso 'type'
      const novasFotos: Foto[] = arquivos.map((arquivo) => ({
        id: crypto.randomUUID(), // Gera um ID único provisório
        url: URL.createObjectURL(arquivo), // Cria uma URL temporária para mostrar o preview
        file: arquivo, // Guarda o arquivo real para enviarmos ao Firebase depois
      }));

      // Atualizamos o estado juntando as fotos antigas com as novas
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

  const handleGuardar = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Dados da vistoria:', vistoria);
    alert('Dê uma olhada no console do navegador (F12) para ver os dados capturados!');
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

        {/* --- NOVA ÁREA DE FOTOS --- */}
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
          
          {/* Grid de Previews */}
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
          style={{ 
            padding: '15px', backgroundColor: '#0056b3', color: 'white', 
            border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px'
          }}
        >
          Guardar Dados
        </button>
      </form>
    </div>
  );
}