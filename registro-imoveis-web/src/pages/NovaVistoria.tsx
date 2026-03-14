import { useState } from 'react';
import type { Vistoria, Ambiente, Foto } from '../types/vistoria';
import { salvarVistoriaNoFirebase } from '../services/vistoriaService';
import logoBranco from '../assets/logo_white.png';

// --- VALIDAÇÃO DO SEI ---
const orgaosValidos: Record<string, string> = {
  "01": "PMM - Prefeitura Municipal de Maringá",
  "03": "MGAPREV - Maringá Previdência",
  "16": "IAM - Instituto Ambiental de Maringá",
};

const secretariasValidas: Record<string, string> = {
  "02": "GAPRE", "03": "PROGE", "04": "SEGOV", "05": "SELOG",
  "06": "SEFAZ", "07": "SEURBH", "08": "SAUDE", "09": "SEDUC",
  "10": "SEBEA", "11": "SEMOB", "12": "SAET", "13": "SAS",
  "14": "SEMUC", "15": "SESP", "16": "SEMULHER", "17": "COMPLIANCE",
  "19": "SEINFRA", "20": "SEMOP", "22": "SEGEP", "26": "SSM",
  "27": "SELURB", "28": "AMETRO", "29": "SETRAB", "31": "SEJUC",
  "33": "SECOM", "34": "SECRIANCA", "35": "AMETECH", "36": "SEPED",
  "99": "Comissões e Conselhos",
};

const listaSecretariasDropdown = Object.values(secretariasValidas);

export function NovaVistoria() {
  const [vistoria, setVistoria] = useState<Partial<Vistoria>>({
    nomeProjeto: '',
    processoSei: '',
    endereco: '',
    secretaria: listaSecretariasDropdown[3], // Padrão SELOG
    ambientes: [],
  });
  
  const [aGuardar, setAGuardar] = useState(false);
  const [msgProcesso, setMsgProcesso] = useState({ text: "", color: "" });

  const handleProcessoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let valor = e.target.value.replace(/\D/g, "");

    if (valor.length > 2) valor = valor.replace(/^(\d{2})(\d)/, "$1.$2");
    if (valor.length > 5) valor = valor.replace(/^(\d{2})\.(\d{2})(\d)/, "$1.$2.$3");
    if (valor.length > 13) valor = valor.replace(/\.(\d{8})(\d)/, ".$1/$2");
    if (valor.length > 17) valor = valor.replace(/\/(\d{4})(\d)/, "/$1.$2");
    if (valor.length > 21) valor = valor.substring(0, 21);

    setVistoria(prev => ({ ...prev, processoSei: valor }));

    if (valor.length >= 5) {
      const partes = valor.split(".");
      const orgao = partes[0];
      const secretaria = partes[1];

      if (!orgaosValidos[orgao]) {
        setMsgProcesso({ text: `❌ Órgão inválido`, color: "#d9534f" });
      } else if (!secretariasValidas[secretaria]) {
        setMsgProcesso({ text: `❌ Secretaria desconhecida`, color: "#d9534f" });
      } else {
        const nomeSec = secretariasValidas[secretaria];
        setMsgProcesso({ text: `✅ ${nomeSec}`, color: "#009639" });
      }
    } else {
      setMsgProcesso({ text: "", color: "" });
    }
  };

  const adicionarAmbiente = () => {
    const nome = prompt("Nome do ambiente (Ex: Fachada, Sala):");
    if (nome) {
      const novoAmbiente: Ambiente = { id: crypto.randomUUID(), nome, fotos: [] };
      setVistoria(prev => ({ ...prev, ambientes: [...(prev.ambientes || []), novoAmbiente] }));
    }
  };

  const handleAdicionarFotos = (ambienteId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const arquivos = Array.from(e.target.files);
      const novasFotos: Foto[] = arquivos.map((arquivo) => ({
        id: crypto.randomUUID(),
        url: URL.createObjectURL(arquivo),
        file: arquivo,
      }));

      setVistoria(prev => ({
        ...prev,
        ambientes: prev.ambientes?.map(amb => 
          amb.id === ambienteId ? { ...amb, fotos: [...amb.fotos, ...novasFotos] } : amb
        )
      }));
    }
  };

  const handleGuardar = async () => {
    if (!vistoria.nomeProjeto || !vistoria.processoSei) {
      alert("Por favor, preencha o Nome do Projeto e o Processo SEI.");
      return;
    }
    try {
      setAGuardar(true);
      await salvarVistoriaNoFirebase(vistoria);
      alert(`Projeto "${vistoria.nomeProjeto}" salvo com sucesso!`);
    } catch (erro) {
      console.error(erro);
      alert("Erro ao salvar.");
    } finally {
      setAGuardar(false);
    }
  };

  return (
    <div>
      <div className="banner-header">
        <img src={logoBranco} alt="Logo CVPIM" />
        <div className="banner-title">
          <h1>REGISTRO FOTOGRÁFICO</h1>
          <div className="sub">CVPIM – Comissão de Vistoria do Patrimônio Imobiliário</div>
        </div>
      </div>

      <div className="container">
        <div className="card">
          <h2>Identificação</h2>
          
          <div className="grid3">
            <div className="field">
              <label>Processo</label>
              <input 
                type="text" 
                placeholder="Ex.: 01.05.0000000/2026"
                value={vistoria.processoSei}
                onChange={handleProcessoChange}
              />
              {msgProcesso.text && <span style={{ color: msgProcesso.color, fontSize: '11px', marginTop: '2px' }}>{msgProcesso.text}</span>}
            </div>

            <div className="field">
              <label>Imóvel</label>
              <input 
                type="text" 
                placeholder="Ex.: Cadastro / Endereço"
                value={vistoria.endereco}
                onChange={e => setVistoria({...vistoria, endereco: e.target.value})}
              />
            </div>

            <div className="field">
              <label>Secretaria</label>
              <select 
                value={vistoria.secretaria}
                onChange={e => setVistoria({...vistoria, secretaria: e.target.value})}
              >
                {listaSecretariasDropdown.map(sec => (
                  <option key={sec} value={sec}>{sec}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="toolbar">
            <input 
              type="text" 
              placeholder="Nome do projeto (obrigatório p/ salvar)" 
              style={{ flex: 1, minWidth: '260px' }}
              value={vistoria.nomeProjeto}
              onChange={e => setVistoria({...vistoria, nomeProjeto: e.target.value})}
            />
            <button type="button" className="btn-ok" onClick={adicionarAmbiente}>Adicionar Ambiente</button>
            <button type="button" className="btn-secondary" onClick={handleGuardar} disabled={aGuardar}>
              {aGuardar ? 'Salvando...' : 'Salvar Projeto'}
            </button>
            <button type="button" className="btn-primary" style={{ background: 'var(--azul)' }}>Gerar PDF</button>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '8px' }}>
            Os projetos serão salvos no banco de dados na nuvem (Firebase).
          </div>
        </div>

        {/* ÁREA DOS AMBIENTES */}
        {vistoria.ambientes?.map((ambiente) => (
          <div key={ambiente.id} style={{ borderLeft: '6px solid var(--verde)', background: '#fff', border: '1px solid var(--border)', borderRadius: '12px', padding: '15px', marginTop: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: 'var(--azul)' }}>{ambiente.nome}</h3>
              <label style={{ background: '#e5e7eb', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                📸 Anexar Fotos
                <input type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={(e) => handleAdicionarFotos(ambiente.id, e)} />
              </label>
            </div>

            {ambiente.fotos.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '12px' }}>
                {ambiente.fotos.map(foto => (
                  <img key={foto.id} src={foto.url} alt="Preview" style={{ width: '120px', height: '90px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ccc' }} />
                ))}
              </div>
            )}
          </div>
        ))}

      </div>
    </div>
  );
}