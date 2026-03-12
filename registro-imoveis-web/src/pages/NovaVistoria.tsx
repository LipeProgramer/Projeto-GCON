import { useState } from 'react';
import { Vistoria } from '../types/vistoria';

export function NovaVistoria() {
  // Estado para guardar os dados que estão a ser preenchidos
  const [vistoria, setVistoria] = useState<Partial<Vistoria>>({
    titulo: '',
    endereco: '',
    observacoes: '',
  });

  // Função que será chamada quando o botão for clicado
  const handleGuardar = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Dados da vistoria:', vistoria);
    // Mais tarde, é aqui que vamos enviar os dados para o Firebase
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h2>Novo Relatório de Vistoria</h2>
      
      <form onSubmit={handleGuardar} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ fontWeight: 'bold', marginBottom: '5px' }}>Título (ex: Vistoria Terreno Zona 07)</label>
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

        <button 
          type="submit" 
          style={{ 
            padding: '15px', 
            backgroundColor: '#0056b3', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px', 
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '16px'
          }}
        >
          Guardar Dados
        </button>
      </form>
    </div>
  );
}